#!/usr/bin/env node
// Checks index.html before a commit: every inline <script> parses, RELEASES (the 版本公告) is well formed, and root files it links to get deployed.
// Run: node tools/check.js   (the pre-commit hook in tools/hooks runs it too)
const fs = require("fs"), path = require("path"), vm = require("vm");
const file = path.join(__dirname, "..", "index.html");
const html = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
const errors = [];
const lineAt = i => html.slice(0, i).split("\n").length;

// 1. inline scripts parse (line numbers point into index.html)
for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
  const start = lineAt(m.index);
  try { new vm.Script(m[1], { filename: "index.html", lineOffset: start - 1 }); }
  catch (e) { errors.push(`script starting at line ${start}: ${e.message}\n${(e.stack || "").split("\n").slice(0, 3).join("\n")}`); }
}

// 2. RELEASES: newest first, unique YYYY-MM-DD.n versions (an old plain YYYY-MM-DD counts as .0), a title and [title, text] items
const at = html.indexOf("\nconst RELEASES=[");
if (at < 0) errors.push("RELEASES not found");
else {
  const end = html.indexOf("\n];", at);
  let list = null;
  try { list = vm.runInNewContext("(" + html.slice(at + "\nconst RELEASES=".length, end + 2) + ")"); }
  catch (e) { errors.push("RELEASES does not evaluate: " + e.message); }
  if (list) {
    const key = v => { const m = /^(\d{4}-\d{2}-\d{2})(?:\.(\d+))?$/.exec(v); return m ? [m[1], +(m[2] || 0)] : null; };
    let prev = null;
    list.forEach((r, i) => {
      const where = `RELEASES[${i}] (${r && r.v})`;
      const k = r && key(r.v);
      if (!k) { errors.push(`${where}: version must look like 2026-10-20.3`); return; }
      if (prev && !(k[0] < prev[0] || (k[0] === prev[0] && k[1] < prev[1])))
        errors.push(`${where}: must be older than the entry above it (${list[i - 1].v}); new entries go at the top`);
      prev = k;
      if (typeof r.title !== "string" || !r.title) errors.push(`${where}: missing title`);
      if (!Array.isArray(r.items) || !r.items.length) errors.push(`${where}: needs at least one item`);
      else r.items.forEach((it, j) => {
        if (!Array.isArray(it) || it.length !== 2 || !it.every(s => typeof s === "string" && s))
          errors.push(`${where} item ${j}: must be ["標題", "說明"]`);
      });
      if ("class" in r && r.class !== true) errors.push(`${where}: class is either true or left out`);
    });
  }
}

// 3. every root file the page links to (href="/favicon.svg") is let through by .vercelignore, which drops everything else from the deploy
const root = path.join(__dirname, "..");
const allowed = fs.readFileSync(path.join(root, ".vercelignore"), "utf8").split(/\r?\n/)
  .filter(l => l.startsWith("!")).map(l => new RegExp("^" + l.slice(1).replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*") + "$"));
for (const m of html.matchAll(/\b(?:href|src)="\/([^"?#\/]+)[^"]*"/g)) {
  const name = m[1], where = `line ${lineAt(m.index)}: /${name}`;
  if (!fs.existsSync(path.join(root, name))) errors.push(`${where} is not in the repo`);
  else if (!allowed.some(re => re.test(name))) errors.push(`${where} is not deployed: add !${name} to .vercelignore`);
}

if (errors.length) { console.error("check failed:\n- " + errors.join("\n- ")); process.exit(1); }
console.log("check ok");
