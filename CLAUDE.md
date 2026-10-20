# 彈唱練習室

Verifying in the preview: `docs/agents/preview-testing.md`.
Before committing: `node tools/check.js` (scripts parse, 版本公告 order); a fresh clone enables it as a hook with `git config core.hooksPath tools/hooks`.
Project map and how each feature works: `HANDOFF.md`.

## Agent skills

### Issue tracker

Issues live in GitHub Issues (Lillian-0306/practice-room), via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five labels: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
