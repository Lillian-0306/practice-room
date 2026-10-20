# Verifying a change in the preview

Steps for checking `index.html` in the Browser pane. Snippets go in `javascript_tool` (top-level `await` works).

## 1. Open and clear the way

`preview_start` with `{name: "practice-room"}` (port 8000; `/class` is 讚頌吉他班). Then run, after every reload:

```js
await new Promise(r=>setTimeout(r,1200));
document.querySelector('dialog[open] .btn')?.click();          // 版本公告「我知道了」
const q=s=>document.querySelector(s);
q('#tab-singing').click();                                      // or #tab-guitar
q('#singing .subtab[data-sub="common"]').click();               // common / learn / projects
q('#piano').closest('.block').scrollIntoView({block:'start',behavior:'instant'});
```

- Reload with `setTimeout(()=>location.reload(),10)`; a bare `location.reload()` cuts the script off.
- Smooth scrolling never moves in the pane: always pass `behavior:'instant'`.
- A fresh profile shows the 使用說明 tour: click 略過說明 (find it with `find`).
- 會員同步「要保留哪一份練習資料」belongs to the user: choose 先不要，之後再決定 or leave it.

## 2. Drive it

- **Audio needs a real gesture.** Start the tuner, metronome or anything with `new AudioContext()` behind an `await` by a `computer` click on a `find` ref; a JS `.click()` leaves the context suspended and silent.
- **Fake microphone** (before clicking 開始調音; `__set(hz)` changes the pitch, harmonics included so octave errors show):

```js
window.__f=82.41;
navigator.mediaDevices.getUserMedia=async()=>{const c=new AudioContext(),d=c.createMediaStreamDestination();window.__oscs=[];
 [[1,.25],[2,.5],[3,.3],[4,.15]].forEach(([k,v])=>{const o=c.createOscillator(),g=c.createGain();g.gain.value=v;o.frequency.value=__f*k;o.connect(g).connect(d);o.start();__oscs.push([o,k])});return d.stream};
window.__set=f=>{__f=f;__oscs.forEach(([o,k])=>o.frequency.value=f*k)};
```

- **Hear what played** (pitches as Hz, in order):

```js
const fr=[],oc=AudioContext.prototype.createOscillator;
AudioContext.prototype.createOscillator=function(){const o=oc.call(this);setTimeout(()=>fr.push(Math.round(o.frequency.value)),0);return o};
// … press keys / buttons …   then: AudioContext.prototype.createOscillator=oc; fr
```

- Keys: `document.dispatchEvent(new KeyboardEvent('keydown',{code:'Digit1',bubbles:true}))`.

## 3. Look at it in every layout state

Done means every state below that the change can touch has been measured or seen:

- 淺色 and 深色: `resize_window {colorScheme}`; also `document.documentElement.dataset.theme`.
- Phone width: `resize_window {preset:"mobile"}`, and `document.documentElement.scrollWidth===innerWidth` (no sideways scroll).
- Toggles that move things: 聽音辨唱名「在琴鍵上顯示對應的按鍵」, 含升降 / 基礎, 歌曲卡片收合, 同學版 `/class`.
- The user's real browser keeps their own settings; when they report a look you can't reproduce, ask which toggles they have, or open their Chrome.

Report anything odd in a screenshot, even when it predates the change.

- `tabs_context` saying the pane is **hidden** means screenshots come back black: read with `javascript_tool` / `read_page` instead.
- Screenshot coordinates are scaled: click by `find` ref, not by pixel guesses.

## 4. Clean up

Reset the viewport (`preset:"desktop"`), put toggles back, and remove test keys you created (`last_view`, test presets, `pr_*` you changed).
