# 彈唱練習室 — 開發交接文件

## 專案目標
互動式學習網頁，分兩大板塊：**吉他學習**與**歌唱學習**。繁體中文（zh-Hant），主要在手機 Chrome 使用。

## 目前狀態
- 單一檔案 `index.html`（HTML + CSS + JS 全部內嵌，無建置流程、無相依套件）。
- 唯一外部資源：Google Fonts（Noto Sans TC、Noto Serif TC），有備援字型。
- 已部署到 GitHub Pages：https://lillian-0306.github.io/practice-room/ （main 分支根目錄，推送後約一分鐘更新）。
- 也發佈在 Claude 內嵌預覽，但**內嵌環境擋麥克風**，麥克風相關功能會顯示錯誤訊息並附上正式網址。

## 樂譜與音檔
- 樂譜 PDF 與示範音檔 mp3 都放在專案根目錄並上傳公開（使用者同意）。
- 新增歌曲：把檔案放進資料夾，在 `index.html` 的 `SONGS` 陣列加一筆（`file` 樂譜、`audio` 音檔）。
- 樂譜在網頁內顯示：每頁轉成 1400px 寬 JPEG 放在 `sheets/<歌曲>/`，`SONGS` 的 `pages` 列出路徑；「開啟樂譜」展開、點圖開大圖；原始 PDF 用 GitHub Pages 連結提供下載。
- 卡片內有播放器、0.5×/0.75×/原速、A-B 循環（`player()`）。
- 「開啟樂譜」若在目前網址找不到檔案（例如 artifact 單檔上限 15 MB 放不下 PDF），會改開 GitHub Pages 上的檔案。

## 本機執行
```
npx http-server -p 8000 -c-1
# 或 python3 -m http.server 8000
# 開 http://localhost:8000
```
localhost 屬於安全環境，`getUserMedia` 可正常跳出麥克風詢問。用手機測試時需 https（可用 GitHub Pages 或 ngrok）。

## 功能清單
**吉他**（分兩個子分頁：「常用」放下列 1–5 項；「專案」列出 `SONGS` 裡的歌曲卡片：歌名、編曲、調音與速度、用到的和弦（點了直接在卡片內顯示指法圖，可刷弦試聽）、開啟樂譜按鈕。上次選的子分頁存在 localStorage `pr_guitar_sub`）
1. 和弦圖與試聽：33 個和弦，分五組（基本、七和弦、sus 掛留、封閉、色彩與高把位）。SVG 動態繪製指法，封閉和弦畫橫按長條，刷下、刷上、逐弦彈。
2. 調音：六條弦參考音，加上麥克風調音器（自動判斷最接近的弦、顯示偏差音分與「轉緊/轉鬆」提示，±5 音分內算準）。
3. 節拍器（獨立）：30–240 BPM、±1 與滑桿、點按測速、拍號 2/4・3/4・4/4・6/8（6/8 重音在 1、4 拍）、細分（無／八分／三連音／十六分）、拍點燈號、6 種合成音色（電子音、木魚、牛鈴、鼓組、拍手、邊擊；`MSOUNDS`，各自有 `k` 音量修正，經 `playSnd()` 播放；鼓組為大鼓／小鼓交替、細分拍用 Hi-hat）。設定存在 localStorage `pr_metro`。
4. 跟拍換和弦：8 組和弦進行、10 種預設刷法（含 16 分、3/4、6/8、切音 ✕）加「自訂」：選拍號與八分/十六分格子，點格子循環 ↓→↑→✕→·，播放中可改，存在 `pr_custom`；選中的刷法存在 `pr_pattern`。50–140 BPM（6/8 以附點四分音符為一拍）。與節拍器共用 lookahead 排程，兩者互斥。
5. 錄音回放：MediaRecorder 錄音，可播放、下載、刪除，最多保留 10 段（只在記憶體，重新整理就消失）。
6. 入門路線：5 項勾選清單。

**歌唱**
1. 呼吸練習：3 種節奏（4-4-6、4-8、4-7-8），圓圈動畫引導。
2. 音高偵測器：麥克風 + 自相關法，顯示音名、Hz、音分偏差、唱名，下方有最近 8 秒的音高曲線（canvas）。
3. 目標音練習：選 Do–高 Do 其中一個目標音（可切換低八度），曲線上畫出目標線與 ±25 音分區間，計算「連續唱準秒數」與最佳紀錄。判斷時忽略八度差。
4. 參考音跟唱：Do 到高 Do，不需麥克風（跟隨低八度設定）。
5. 聽音辨唱名：先播 Do 再播目標音，選唱名並計分。
6. 錄音回放：同吉他。
7. 每日暖聲清單：5 項勾選清單。

## 程式結構（index.html 內 JS，單一 IIFE）
- 工具：`# 彈唱練習室 — 開發交接文件

## 專案目標
互動式學習網頁，分兩大板塊：**吉他學習**與**歌唱學習**。繁體中文（zh-Hant），主要在手機 Chrome 使用。

## 目前狀態
- 單一檔案 `index.html`（HTML + CSS + JS 全部內嵌，無建置流程、無相依套件）。
- 唯一外部資源：Google Fonts（Noto Sans TC、Noto Serif TC），有備援字型。
- 已部署到 GitHub Pages：https://lillian-0306.github.io/practice-room/ （main 分支根目錄，推送後約一分鐘更新）。
- 也發佈在 Claude 內嵌預覽，但**內嵌環境擋麥克風**，麥克風相關功能會顯示錯誤訊息並附上正式網址。

## 本機執行
```
python3 -m http.server 8000
# 開 http://localhost:8000
```
localhost 屬於安全環境，`getUserMedia` 可正常跳出麥克風詢問。用手機測試時需 https（可用 GitHub Pages 或 ngrok）。

## 功能清單
**吉他**
1. 和弦圖與試聽：28 個和弦，分四組（基本、七和弦、sus 掛留、封閉）。SVG 動態繪製指法，封閉和弦畫橫按長條，刷下、刷上、逐弦彈。
2. 調音：六條弦參考音，加上麥克風調音器（自動判斷最接近的弦、顯示偏差音分與「轉緊/轉鬆」提示，±5 音分內算準）。
3. 跟拍換和弦：8 組和弦進行（含 8 小節卡農進行）、節拍器、八分音符刷弦節奏圖（↓ · ↓ ↑ · ↑ ↓ ↑）、50–140 BPM。用 Web Audio lookahead 排程，不會飄拍。
4. 錄音回放：MediaRecorder 錄音，可播放、下載、刪除，最多保留 10 段（只在記憶體，重新整理就消失）。
5. 入門路線：5 項勾選清單。

**歌唱**
1. 呼吸練習：3 種節奏（4-4-6、4-8、4-7-8），圓圈動畫引導。
2. 音高偵測器：麥克風 + 自相關法，顯示音名、Hz、音分偏差、唱名，下方有最近 8 秒的音高曲線（canvas）。
3. 目標音練習：選 Do–高 Do 其中一個目標音（可切換低八度），曲線上畫出目標線與 ±25 音分區間，計算「連續唱準秒數」與最佳紀錄。判斷時忽略八度差。
4. 參考音跟唱：Do 到高 Do，不需麥克風（跟隨低八度設定）。
5. 聽音辨唱名：先播 Do 再播目標音，選唱名並計分。
6. 錄音回放：同吉他。
7. 每日暖聲清單：5 項勾選清單。

## 程式結構（index.html 內 JS，單一 IIFE）
、`el`、`load/save`（localStorage，皆 try/catch）、`midiFreq/freqMidi/noteName`。
- 麥克風（調音器與音高偵測共用，一次只開一個）：`openMic/closeMic/readPitch/autoCorrelate`，錯誤訊息由 `micError()` 統一處理。
- 音訊：`audio()` 懶建立 AudioContext；`pluck()` 用 Karplus-Strong 合成吉他聲；`tone()` 用振盪器加包絡；`click()` 節拍器。
- 分頁：`.mode` 按鈕切換 `body[data-mode]`，CSS 變數 `--accent` 隨模式在琥珀（吉他）與鈷藍（歌唱）間切換。切換時會停止另一邊的節拍器、調音器、麥克風、呼吸練習與錄音。
- 吉他：`CH` 和弦資料表（`f` 為六弦品位，-1 不彈、0 空弦；`fg` 為手指編號；`b` 為橫按 `[品位, 起弦, 終弦]`；`s` 為圖上起始品位，品位一律寫絕對值）、`renderChord(svg, 名稱)` 可畫進任何 svg、`GROUPS`、`drawChord()`、`strum()`；調音器 `tunerLoop/startTuner/stopTuner`；跟拍播放 `scheduler()` 與節拍器 `mScheduler()` 都每 25ms 預排未來 120ms，UI 用 setTimeout 對齊；刷法資料 `PATS`（`beats`、`sub` 每拍格數、`slots` 為 D/U/X/空字串），`click(時間, 等級 0–2)`、`chuck()` 切音。
- 錄音：`recorder(root, 檔名前綴)` 產生元件，吉他 `recG`、歌唱 `recS`。
- 歌唱：`BREATHS`、`SCALE`、`singLoop/startSing/stopSing`、`drawCurve()`、`setTarget()`、`KEYS`、`answer()`。
- 子分頁：吉他與歌唱都分「常用／專案」，`showSub(panel, sub)` 共用；離開「常用」時由 `SUB_STOP` 停止該邊正在跑的東西（吉他：跟拍、節拍器、調音器、錄音；歌唱：音高偵測、呼吸、錄音）。歌唱的「專案」目前是空的。
- localStorage 鍵：`pr_guitar`、`pr_singing`（皆為布林陣列）、`pr_guitar_sub`／`pr_singing_sub`（`common` 或 `projects`）。

## 設計決策
- 色彩用 CSS 變數，含淺色與深色（`prefers-color-scheme` + `data-theme`）。
- 標題用 Noto Serif TC，內文用 Noto Sans TC。
- 版面寬度上限 880px，手機優先，加入 safe-area 內距。
- 尊重 `prefers-reduced-motion`。
- 音訊必須由使用者操作後才啟動（瀏覽器限制）。

## 已知問題與限制
- 音高偵測只適合單音；音量太小、背景吵或高音區會不穩。自相關法每格約 15ms，慢手機上畫面更新率會降低。
- 調音器偶爾會抓到泛音（高八度）；用中位數平滑減少跳動，但沒有完全排除。
- 和弦圖只顯示 1–5 格，更高把位的和弦需要加「起始品位」欄位。
- 分頁在背景時瀏覽器會降低計時器頻率，節拍器會暫停跳拍（回到前景後自動接上，不會補一堆拍子）。
- 錄音不會持久保存，重新整理就消失。
- 沒有自動化測試。
- 進度只存在單一瀏覽器，不跨裝置。

## 建議下一步
（已完成：GitHub Pages 部署、lookahead 節拍器、麥克風調音器、音高曲線與目標音練習、和弦擴充與橫按線、錄音回放。）
1. 做成 PWA（manifest + service worker）以便離線使用，並自帶字型。
2. 錄音存進 IndexedDB，重新整理後還在。
3. 和弦圖支援起始品位，加入更多高把位和弦；節奏型態可選擇。
4. 程式規模變大時，改用 Vite 並拆成模組（audio、guitar、singing、storage）。

## 給 Claude Code 的起始提示（可直接貼上）
> 請閱讀 `HANDOFF.md` 與 `index.html`。這是一個繁體中文的吉他與歌唱互動學習網頁。先用 `python3 -m http.server` 跑起來確認可用，然後從「建議下一步」的第 1 項開始，一次做一項，每項完成後讓我確認再繼續。保持單一檔案架構，除非我同意才拆分模組。
