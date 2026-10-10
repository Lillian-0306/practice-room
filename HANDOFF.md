# 彈唱練習室 — 開發交接文件

## 專案目標
互動式學習網頁，分兩大板塊：**吉他學習**與**歌唱學習**。繁體中文（zh-Hant），主要在手機 Chrome 使用。

## 目前狀態
- 單一檔案 `index.html`（HTML + CSS + JS 全部內嵌，無建置流程、無相依套件）。
- 唯一外部資源：Google Fonts（Noto Sans TC、Noto Serif TC），有備援字型。
- 正式網址（Vercel）：https://practice-room-one.vercel.app 。Vercel 專案已連結 GitHub 倉庫，推送到 main 會自動發布（約一分鐘）；也可用 Vercel CLI `vercel --prod` 從本機發布。`.vercelignore` 只上傳 index.html、sheets/、songs/、mp3、pdf。網頁裡的正式網址常數是 `SITE`。
- GitHub Pages（https://lillian-0306.github.io/practice-room/ ）已關閉，改用 Vercel；要恢復可執行 `gh api -X POST repos/Lillian-0306/practice-room/pages -f "source[branch]=main" -f "source[path]=/"`。
- 也發佈在 Claude 內嵌預覽，但**內嵌環境擋麥克風**，麥克風相關功能會顯示錯誤訊息並附上正式網址。

## 樂譜與音檔
- 樂譜 PDF 與示範音檔 mp3 都放在專案根目錄並上傳公開（使用者同意）。
- 新增歌曲：把檔案放進資料夾，在 `index.html` 的 `SONGS` 陣列加一筆（`file` 樂譜、`audio` 音檔）。`audio` 可以是單一檔名，或 `[{src, label}]` 多個版本（卡片內用按鈕切換，共用速度與 A-B 循環；檔名會 `encodeURIComponent`，可含 `#`）。
- 目前歌曲：生命的太陽 + 凝眸 + 幸福時刻（5 頁，音檔有示範與含節拍器 Click 版）、勇悍行（3 頁）、相思湖畔（1 頁，移調夾 2 格，音檔有吉他示範、人聲 C 調、人聲 #C 調）。
- PDF 轉圖：電腦沒有 pdftoppm 等工具時，可用 PowerShell 呼叫 Windows 內建的 `Windows.Data.Pdf` 繪製，再用 System.Drawing 縮成 1400px 寬 JPEG（注意 Windows 顯示比例會讓輸出變大，要再縮一次）。
- 樂譜在網頁內顯示：每頁轉成 1400px 寬 JPEG 放在 `sheets/<歌曲>/`，`SONGS` 的 `pages` 列出路徑；「開啟樂譜」展開、點圖開大圖；原始 PDF 用 GitHub Pages 連結提供下載。
- 卡片內有播放器、0.5×/0.75×/原速、A-B 循環（`player()`）。
- 「開啟樂譜」若在目前網址找不到檔案（例如 artifact 單檔上限 15 MB 放不下 PDF），會改開 GitHub Pages 上的檔案。

## 本機執行
```
npx http-server -p 8000 -c-1
# 或 python3 -m http.server 8000
# 開 http://localhost:8000
```
localhost 屬於安全環境，`getUserMedia` 可正常跳出麥克風詢問。用手機測試時需 https（用 Vercel 正式網址或預覽網址）。

## 功能清單
**吉他**（分三個子分頁：「常用」放下列 1–6 項；「學習」是民謠吉他學習地圖（`LEARN` 四個階段＋`LRES` 學習資源，內容來自使用者的學習地圖文件）：階段卡片可展開，技能與檢驗標準可打勾（`pr_learn`，展開狀態 `pr_learn_open`），「去練習」按鈕用 `learnGo()` 跳到常用的工具並設定好和弦／刷法／速度；「專案」列出 `SONGS` 裡的歌曲卡片：歌名、編曲、調音與速度、用到的和弦（點了直接在卡片內顯示指法圖，可刷弦試聽）、開啟樂譜按鈕。上次選的子分頁存在 localStorage `pr_guitar_sub`，可為 common／learn／projects）
1. 和弦圖與試聽：34 個和弦，分五組（基本、七和弦、sus 掛留、封閉、色彩與高把位）。SVG 動態繪製指法，封閉和弦畫橫按長條，刷下、刷上、逐弦彈。
2. 調音：六條弦參考音，加上麥克風調音器（自動判斷最接近的弦、顯示偏差音分與「轉緊/轉鬆」提示，±5 音分內算準）。
3. 節拍器（獨立）：30–240 BPM、±1 與滑桿、點按測速、拍號 2/4・3/4・4/4・6/8（6/8 重音在 1、4 拍）、細分（無／八分／三連音／十六分）、拍點燈號、6 種合成音色（電子音、木魚、牛鈴、鼓組、拍手、邊擊；`MSOUNDS`，各自有 `k` 音量修正，經 `playSnd()` 播放；鼓組為大鼓／小鼓交替、細分拍用 Hi-hat）。設定存在 localStorage `pr_metro`。
4. 跟拍換和弦：8 組和弦進行加「自訂」（從和弦盤點選、最多 16 小節，存在 `pr_custom_prog`；選中的進行存在 `pr_prog`）；進行下方顯示每小節的和弦圖，−/＋ 五段大小或只顯示名稱（`DZ`、`pr_prog_zoom`），播放時當前小節亮起、該圖的弦會跟著刷弦發光；10 種預設刷法（含 16 分、3/4、6/8、切音 ✕）加「自訂」：選拍號與八分/十六分格子，點格子循環 ↓→↑→✕→·，播放中可改，存在 `pr_custom`；選中的刷法存在 `pr_pattern`。50–140 BPM（6/8 以附點四分音符為一拍）。與節拍器共用 lookahead 排程，兩者互斥。
5. 錄音回放：MediaRecorder 錄音，可播放、下載、刪除，最多保留 10 段（只在記憶體，重新整理就消失）。
6. 入門路線：5 項勾選清單。
7. 自動捲譜（只在「專案」子分頁顯示）：右下角圓形按鈕（窄螢幕時在選單按鈕上方），滑鼠移上去顯示「自動捲譜」，點開才出現操作面板：播放／暫停、速度滑桿 1.0–10.0（每 0.1 一格，每秒 6–64px 等比例變化，拖動中即時生效，放開時存到 `pr_autoscroll`）、「回到第一頁：<歌名>」（組曲「A + B + C」只寫第一首 A）（以畫面中間所在的歌曲卡片判斷是哪一首，那首樂譜沒開時改用上方最近一份開著的樂譜；按鈕上的歌名在面板開著時會跟著捲動更新；沒開任何樂譜時停用並提示）。捲動時頁面只捲整數像素，不足 1px 的部分用 `.wrap` 的 translate3d 補上，避免慢速時一頓一頓。點面板外或按 Esc 收起，收起後仍會繼續捲動，按鈕右上角綠點表示捲動中；開始捲動過一次後，只要面板收起，按鈕上方就會有兩顆圓形捷徑（由下往上：「暫停／繼續」、「回到第一頁」，滑鼠移上去顯示提示與歌名）。暫停後捷徑保留，暫停鍵變成「繼續」；打開面板時暫時隱藏，離開「專案」才重置。捲動中可手動拖動調整位置，會從新位置繼續；到底自動停止；離開「專案」或切到歌唱就停止。支援的瀏覽器會在捲動時保持螢幕不關（Wake Lock）。

**歌唱**
1. 呼吸練習：3 種節奏（4-4-6、4-8、4-7-8），圓圈動畫引導。
2. 音高偵測器：麥克風 + 自相關法，顯示音名、Hz、音分偏差、唱名，下方有最近 8 秒的音高曲線（canvas）。
3. 目標音練習：選 Do–高 Do 其中一個目標音（可切換低八度），曲線上畫出目標線與 ±25 音分區間，計算「連續唱準秒數」與最佳紀錄。判斷時忽略八度差。
4. 參考音跟唱：Do 到高 Do，不需麥克風（跟隨低八度設定）。
5. 聽音辨唱名：先播 Do 再播目標音，選唱名並計分。音域可選「基礎（白鍵 Do–Do）」或「含升降」（加五個黑鍵，鋼琴排列）；題目可選一個音、兩個音或三個音；多個音時在 Do 之後**同時**播放（音量依音數調低），作答不分順序，再點一次可取消，全部選對才算對。設定存在 `pr_ear`。
6. 錄音回放：同吉他。
7. 每日暖聲清單：5 項勾選清單。

## 程式結構（index.html 內 JS，單一 IIFE）
- 工具：`$`、`el`、`load/save`（localStorage，皆 try/catch）、`midiFreq/freqMidi/noteName`。
- 麥克風（調音器與音高偵測共用，一次只開一個）：`openMic/closeMic/readPitch/autoCorrelate`，錯誤訊息由 `micError()` 統一處理。
- 音訊：`audio()` 懶建立 AudioContext；`pluck()` 用 Karplus-Strong 合成吉他聲；`tone()` 用振盪器加包絡；`click()` 節拍器。
- 分頁：`.mode` 按鈕切換 `body[data-mode]`，CSS 變數 `--accent` 隨模式在琥珀（吉他）與鈷藍（歌唱）間切換。切換時會停止另一邊的節拍器、調音器、麥克風、呼吸練習與錄音。
- 吉他：`CH` 和弦資料表（`f` 為六弦品位，-1 不彈、0 空弦；`fg` 為手指編號；`b` 為橫按 `[品位, 起弦, 終弦]`；`s` 為圖上起始品位，品位一律寫絕對值）、`renderChord(svg, 名稱)` 可畫進任何 svg、`GROUPS`、`drawChord()`、`strum()`；調音器 `tunerLoop/startTuner/stopTuner`；跟拍播放 `scheduler()` 與節拍器 `mScheduler()` 都每 25ms 預排未來 120ms，UI 用 setTimeout 對齊；刷法資料 `PATS`（`beats`、`sub` 每拍格數、`slots` 為 D/U/X/空字串），`click(時間, 等級 0–2)`、`chuck()` 切音。
- 錄音：`recorder(root, 檔名前綴)` 產生元件，吉他 `recG`、歌唱 `recS`。
- 歌唱：`BREATHS`、`SCALE`、`singLoop/startSing/stopSing`、`drawCurve()`、`setTarget()`、`WHITE`／`BLACK`、`SOLF`、`answer()`。
- 子分頁：吉他分「常用／學習／專案」、歌唱分「常用／專案」，`showSub(panel, sub)` 依該面板的 `.subtab` 切換對應的 `#g-…`／`#s-…` 區塊；左側清單的 `NAV[].subs` 決定每個面板列出哪些子分頁；離開「常用」時由 `SUB_STOP` 停止該邊正在跑的東西（吉他：跟拍、節拍器、調音器、錄音；歌唱：音高偵測、呼吸、錄音）。歌唱的「專案」列出 `VSONGS`（目前：篇章，YouTube 影片），`ytPlayer()` 先顯示縮圖，點了才載入 youtube-nocookie 播放器，另附「在 YouTube 開啟」連結。
- 跟唱比對（`karaPanel()`）：歌曲有 `melody` 時出現。用 YouTube IFrame API 的 `getCurrentTime()` 當時間軸，目標音符來自 `songs/*-melody.json`（`notes: [[開始秒, 長度秒, MIDI]]`），麥克風音高摺到目標的八度後比對，±50 音分算準；計分以時間加權、每個音前 80ms 不計；可升降 Key（±7）；停止後列出最不準的音，點了跳回前 2 秒。
- 篇章的旋律是從原曲錄音自動辨識（Melodia 式諧波顯著度 + Viterbi 追蹤，濾掉 C3 以下的貝斯），378 個音、B 大調、調音偏差約 +1 音分，可能有錯音或漏音。原曲 MP3 只在使用者電腦，不進倉庫。
- localStorage 鍵：`pr_guitar`、`pr_singing`（皆為布林陣列）、`pr_guitar_sub`／`pr_singing_sub`（`common` 或 `projects`）。

## 設計決策
- 導覽清單：寬度 ≥1024px 時左側固定側欄（248px，`body` 左邊留白）；較窄時隱藏，右下角圓形 ☰ 按鈕打開抽屜（背景變暗，點項目／背景／Esc／× 關閉）。清單由頁面自動產生（`buildNav()`：常用取各 `.block` 的 h2，專案取 `.song` 的 h3），新增區塊或歌曲會自動出現；捲動時標示目前區塊（`navSpy()`），點選後暫時固定標示被選的項目。電腦版可收合：清單右上角「收合」按鈕隱藏側欄、內容回到置中，收合後左上角出現「展開」按鈕；狀態存在 `pr_nav_collapsed`（`body.nav-collapsed`）。電腦版可拖曳側欄右緣調整寬度 180–420px（`#navResize`，CSS 變數 `--navw`，存在 `pr_nav_w`），雙擊恢復 248px，鍵盤左右鍵每次 16px。清單裡每個「常用／專案」右邊有 ▾ 按鈕可展開／收起該組（`setFold()`，存在 `pr_nav_fold`）；點名稱會切換頁面並自動展開。深色模式下捲動條用 `color-scheme` 跟著變深，側欄捲動條為細的主題色。
- 色彩用 CSS 變數，含淺色與深色（`prefers-color-scheme` + `data-theme`）。右上角「風格」按鈕（調色盤圖示）切換網頁風格：簡約（預設，不加屬性）、復古紙本 `paper`、霓虹舞台 `neon`、圓潤可愛 `soft`；每種風格在 `:root[data-style]` 各有一組亮色與深色的色彩變數，各自有字體（`--sans`／`--serif`／數字用 `--num`）與質感：復古紙本＝霞鶩文楷 TC＋Special Elite、紙紋噪點、橫線筆記本＋紅色邊線、紙膠帶、手繪邊框按鈕；霓虹舞台＝Orbitron 發光數字、聚光燈背景、毛玻璃卡片＋桃紅青藍漸層邊、漸層發光按鈕；圓潤可愛＝粉圓體 Huninn＋Fredoka、圓點與色塊背景、無邊框柔影卡片、可按下的立體按鈕。字體都從 Google Fonts 按需載入。選擇存在 `pr_style`。右上角按鈕切換亮／暗，選擇存在 `pr_theme`；沒選過就跟系統。`<head>` 裡有一小段 script 在畫面出現前套用，避免閃一下。
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
