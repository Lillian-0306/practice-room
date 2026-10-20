# 彈唱練習室 — 開發交接文件

## 專案目標
互動式學習網頁，分兩大板塊：**吉他學習**與**歌唱學習**。繁體中文（zh-Hant），主要在手機 Chrome 使用。

## 目前狀態
- 單一檔案 `index.html`（HTML + CSS + JS 全部內嵌，無建置流程、無相依套件）。
- 唯一外部資源：Google Fonts（Noto Sans TC、Noto Serif TC），有備援字型。
- 正式網址（Vercel）：https://practice-room-one.vercel.app 。Vercel 專案已連結 GitHub 倉庫，推送到 main 會自動發布（約一分鐘）；也可用 Vercel CLI `vercel --prod` 從本機發布。`.vercelignore` 只上傳 index.html、sheets/、songs/、mp3、pdf。網頁裡的正式網址常數是 `SITE`。
- **同學版**（給吉他班同學用）：https://practice-room-one.vercel.app/class 。同一份 `index.html`，`vercel.json` 把 `/class` 改寫到 index.html（`trailingSlash:false` 讓 `/class/` 轉回 `/class`，相對路徑的樂譜與音檔才找得到）。`<head>` 的小 script 判斷網址後設定 `html[data-edition="class"]`，JS 常數 `CLASS`：只顯示吉他「專案」（隱藏吉他／歌唱切換與子分頁，側欄只列專案歌曲），標題改為「讚頌吉他班」，且不寫入 `pr_guitar_sub`。本機測試用 `http://localhost:8000/class`（`.claude/serve.js` 有同樣的改寫）或 `?class`。新增到 `SONGS` 的歌會同時出現在同學版。
- GitHub Pages（https://lillian-0306.github.io/practice-room/ ）已關閉，改用 Vercel；要恢復可執行 `gh api -X POST repos/Lillian-0306/practice-room/pages -f "source[branch]=main" -f "source[path]=/"`。
- 也發佈在 Claude 內嵌預覽，但**內嵌環境擋麥克風**，麥克風相關功能會顯示錯誤訊息並附上正式網址。

## 樂譜與音檔
- 樂譜 PDF 與示範音檔 mp3 都放在專案根目錄並上傳公開（使用者同意）。
- 新增歌曲：把檔案放進資料夾，在 `index.html` 的 `SONGS` 陣列加一筆（`file` 樂譜、`audio` 音檔）。`audio` 可以是單一檔名，或 `[{src, label}]` 多個版本（卡片內用按鈕切換，共用速度與 A-B 循環）。檔名不要含 `#`、`?`、`%`（artifact 無法存放這類檔名，例如 voc#C 改名為 voc升C）。
- 目前歌曲：生命的太陽 + 凝眸 + 幸福時刻（5 頁，音檔有示範與含節拍器 Click 版）、勇悍行（3 頁）、相思湖畔（1 頁，移調夾 2 格，音檔有吉他示範、人聲 C 調、人聲 #C 調）。
- PDF 轉圖：電腦沒有 pdftoppm 等工具時，可用 PowerShell 呼叫 Windows 內建的 `Windows.Data.Pdf` 繪製，再用 System.Drawing 縮成 1400px 寬 JPEG（注意 Windows 顯示比例會讓輸出變大，要再縮一次）。
- 樂譜在網頁內顯示：每頁轉成 1400px 寬 JPEG 放在 `sheets/<歌曲>/`，`SONGS` 的 `pages` 列出路徑；「開啟樂譜」展開、點圖開大圖；原始 PDF 用 GitHub Pages 連結提供下載。
- 卡片內有播放器、A-B 循環（`player(src, bpm)`）。播放速度以 BPM 調整：`SONGS[].bpm` 是原曲速度（組曲 70、勇悍行 96、相思湖畔 110，已用音檔量測核對），−／＋ 每次 1 BPM、滑桿 40%–125%、快捷鍵 60%／75%／原速；保持音高（`preservesPitch`），切換音檔版本時維持同樣的速度比例。卡片裡的「段落循環」與「用到的和弦」可點標題收起／展開（`foldSection(kind, …)`），狀態依種類存在 `pr_card_fold`，所有卡片同步。單一音檔也可在 `{src,label,bpm}` 指定自己的原速。
- 「開啟樂譜」若在目前網址找不到檔案（例如 artifact 單檔上限 15 MB 放不下 PDF），會改開 GitHub Pages 上的檔案。

## 本機執行
```
npx http-server -p 8000 -c-1
# 或 python3 -m http.server 8000
# 開 http://localhost:8000
```
localhost 屬於安全環境，`getUserMedia` 可正常跳出麥克風詢問。用手機測試時需 https（用 Vercel 正式網址或預覽網址）。

## 功能清單
**吉他**（分三個子分頁：「常用」放下列 1–6 項；「學習」由 `LMODS` 模塊組成（`renderLearn()` 每個模塊一個可收合的 `details.lmod`，預設收起，只顯示標題、說明與進度，點開才顯示內容；開關狀態存在 `pr_learn_open` 的 `mod-<id>`；樣式跟階段卡片一樣（`icon` 圓圈圖示、`t` 標題、`sub` 副標、進度條），`d` 說明在展開後顯示；頁面上不寫「模塊」兩字，側欄只列模塊；第一個是「練習追蹤」（`renderTrack()`）：每天練習秒數存在 `pr_gpractice`（`{"YYYY-MM-DD": 秒}`，跟其他 `pr_` 一起同步）。每 5 秒 `pracTick()` 看 `gActiveName()`（練習計時、跟著節拍換和弦 `playing`、節拍器 `mOn`、歌曲節拍器 `songMetroOff`、#guitar 裡正在播的 audio、自動捲譜 `#asPlay`、調音器 `tunerOn`、吉他錄音），有在用就加上距上次的真實時間（最多 30 秒，電腦睡著不會亂加），累積 30 秒或停下來時寫入；切到背景、關頁也會寫入。「開始練習計時」是不靠工具的手動計時（`pracSet()`；只存在這一頁，關頁／重新整理就結束，pagehide 會先寫入）。吉他專案按「開啟樂譜」時 `pracAsk()` 會問要不要開始計時（每次造訪只問一次、計時中不問、同學版不問），計時中歌曲卡片按鈕旁的 `.prac-live` 顯示經過時間和「■ 停止」按鈕，練習追蹤裡「在專案頁面顯示計時」可以關掉（`pr_prac_live`）。上面四格：今天、這週（週一起算）、連續天數（每天至少 1 分鐘，今天還沒練就從昨天算）、總共。熱力圖每欄一週（週一在上），依容器寬度顯示 8–53 週，顏色 0／<15／<30／<60／60 分以上五級（`color-mix` 混 `--accent`）；點格子看那天並可用 −5／+5／+15／+30 分補記（預設今天）。接著是民謠吉他學習地圖 `renderMap()`，之後會加「和弦與刷法」「指彈 Fingerstyle」等模塊）。學習地圖（`LEARN` 四個階段＋`LRES` 學習資源，內容來自使用者的學習地圖文件）：階段卡片可展開，技能與檢驗標準可打勾（`pr_learn`，展開狀態 `pr_learn_open`），「去練習」按鈕用 `learnGo()` 跳到常用的工具並設定好和弦／刷法／速度。技巧文章放在 `ARTS`（目前：arpeggio 分解和弦、percussive 打板、mute 悶音；每篇有 t 標題、s 卡片說明、lead 導言、body 內文 HTML、go 去練習、res 學習資源），學習地圖的文字裡寫 `[[顯示文字|key]]` 就會變成連到該文章的超連結（`artText()` 轉換，用在項目標題、說明、子項目與階段介紹）。文章內容目前是草稿，使用者之後會自己填。`openArt(key)` 在 `#g-learn` 裡以 `.reading` 隱藏地圖、改顯示 `.lart-wrap` 的文章，網址變成 `#art=key`（可直接分享，手機返回鍵會回到地圖原位置）；`closeArt()` 回地圖，側欄跳轉時 `navGo` 會先關閉文章。同學版不會開文章；「專案」列出 `SONGS` 裡的歌曲卡片：歌名、編曲、調音與速度、用到的和弦（點了直接在卡片內顯示指法圖，可刷弦試聽）、開啟樂譜按鈕。上次選的子分頁存在 localStorage `pr_guitar_sub`，可為 common／learn／projects）
1. 和弦圖與試聽：34 個和弦，分五組（基本、七和弦、sus 掛留、封閉、色彩與高把位）。SVG 動態繪製指法，封閉和弦畫橫按長條，刷下、刷上、逐弦彈。
2. 調音：仿調音 App 的畫面。弧形刻度（±50 音分對應 ±70°，指針泡泡平滑移動）＋ 3+3 琴頭 SVG 和六個弦鈕。預設「自動辨識弦」，點弦鈕改成只調那條（沒開調音器時也會播標準音）。±4 音分停住 0.6 秒算調好：叮一聲、手機震動、弦鈕打勾；勾勾會一直保留（停止調音也不清），按「重新開始」`#tReset` 才清掉。
3. 節拍器（獨立，仿 Soundcorset）：速度轉盤 `#mDial`（拖轉 6° = 1 BPM、滾輪／方向鍵 ±1、Page 鍵 ±10、空白鍵開始停止，20–300 BPM，中間顯示速度術語 `TERMS`）、−／＋ 按住連續、點按測速；拍號每小節 1–12 拍 × 以 2／4／8 分音符為一拍（`ms.beats/den`）；每拍強弱 `ms.acc`（3 強／2 中／1 弱／0 靜音整拍，點拍子格循環；換拍號時用 `accDef()` 重設，/8 且拍數為 3 的倍數時三拍一組）；節奏型 `MPATS`（四分、八分、三連音、十六分、搖擺、附點、八＋十六、十六＋八，`patSvg()` 畫小樂譜）；練習工具：漸快 `ms.tr`（每幾小節加減幾 BPM 到目標，只在播放中改變速度，停止後回到原速）、靜音 `ms.sil`（響 X 小節、靜音 Y 小節）、計時 `ms.timer`（分鐘，時間到停止並叮一聲）；我的設定 `pr_metro_presets`（最多 20 組，同名覆蓋，存 bpm/beats/den/acc/sub/snd）。排程每次排一整拍（`mBeatOut()`），舊版 `ms.meter` 會換成 beats/den。6 種合成音色（電子音、木魚、牛鈴、鼓組、拍手、邊擊；`MSOUNDS`，各自有 `k` 音量修正，經 `playSnd()` 播放；鼓組為大鼓／小鼓交替、細分拍用 Hi-hat）。設定存在 localStorage `pr_metro`。
4. 跟拍換和弦：和弦進行依 `PROG_GROUPS` 分組顯示：C 調和弦轉換（C–Dm–Em–F–G–Am–G7，順階 I–VII）、G 調和弦轉換（G–Am–Bm–C–D–Em–D7）、卡農進行、簡易入門（其餘 7 組），最後是「自訂」（從和弦盤點選、最多 16 小節，存在 `pr_custom_prog`）；選中的進行以和弦字串（如 `"C-G-Am-F"`，自訂是 `"custom"`）存在 `pr_prog`，舊版存的是位置，用 `OLD_PROG_ORDER` 換算；進行下方顯示每小節的和弦圖，−/＋ 五段大小或只顯示名稱（`DZ`、`pr_prog_zoom`），播放時當前小節亮起、該圖的弦會跟著刷弦發光；9 種預設刷法（含 16 分、3/4、6/8、切音 ✕；已移除「八分下刷」）加「自訂」：選拍號與八分/十六分格子，點格子循環 ↓→↑→↓↑→✕→·（↓↑ 是 `B`：同一格先下刷、半格後上刷），播放中可改，存在 `pr_custom`；「自訂」可以取名按「儲存刷法」存成自己的刷法（`pr_my_pats`：`[{n, meter, grid, slots}]`，排在內建刷法和自訂之間，按鈕前有 ★；同名會覆蓋，不能和內建刷法同名）；選到自己的刷法時下方 `#patMine` 有改名、修改節奏（複製到自訂、名稱帶入）、刪除；刷法最後的「編輯」按鈕切換刪除模式（`patEditing`）：點刷法勾選（`patSel`，可多選，自訂不能選），下方「刪除所選（N）」用 `confirmDelPat(list)` 跳出列出名稱、「刪除後無法復原」的確認視窗（取消／確認刪除）；選到自己的刷法時的「× 刪除」也用同一個視窗；刪掉的內建刷法名稱存在 `pr_pat_hidden`，載入時移除（沒有恢復功能，`setPattern` 收到不存在的刷法會直接略過）；選中的刷法以名稱存在 `pr_pattern`（舊版存的是位置，載入時會換算）。50–140 BPM（6/8 以附點四分音符為一拍）。與節拍器共用 lookahead 排程，兩者互斥。
5. 錄音回放：MediaRecorder 錄音，可播放、下載、刪除，最多保留 10 段（只在記憶體，重新整理就消失）。
6. 入門路線：5 項勾選清單。
7. 自動捲譜（只在「專案」子分頁顯示）：右下角圓形按鈕（窄螢幕時在選單按鈕上方），滑鼠移上去顯示「自動捲譜」，點開才出現操作面板：播放／暫停、速度滑桿 1.0–10.0（每 0.1 一格，每秒 6–64px 等比例變化，拖動中即時生效，放開時存到 `pr_autoscroll`）、「回到第一頁：<歌名>」（組曲「A + B + C」只寫第一首 A）（以畫面中間所在的歌曲卡片判斷是哪一首，那首樂譜沒開時改用上方最近一份開著的樂譜；按鈕上的歌名在面板開著時會跟著捲動更新；沒開任何樂譜時停用並提示）。捲動時頁面只捲整數像素，不足 1px 的部分用 `.wrap` 的 translate3d 補上，避免慢速時一頓一頓。點面板外或按 Esc 收起，收起後仍會繼續捲動，按鈕右上角綠點表示捲動中；開始捲動過一次後，只要面板收起，按鈕上方就會有兩顆圓形捷徑（由下往上：「暫停／繼續」、「回到第一頁」，滑鼠移上去顯示提示與歌名）。暫停後捷徑保留，暫停鍵變成「繼續」；打開面板時暫時隱藏，離開「專案」才重置。捲動中可手動拖動調整位置，會從新位置繼續；到底自動停止；離開「專案」或切到歌唱就停止。支援的瀏覽器會在捲動時保持螢幕不關（Wake Lock）。
   - 歌曲卡片的播放器裡有可折疊的「節拍器」（在「段落循環」上面）：開始／停止、拖動條 30–240 BPM（預設＝歌曲 BPM × 播放速度，調播放速度時會重新對齊）、拍號 2/4・3/4・4/4・6/8、拍點燈號、6 種音色（專案自己的設定 `songSnd`，存在 `pr_song_snd`，所有歌曲共用，第一次沿用常用頁的選擇；預備拍也用這個音色；停止時點音色會試聽）。音量 `songVol`（`pr_song_vol`，0–150%，所有歌曲和預備拍共用；`setSongSnd()`／`setSongVol()` 同步每張卡片和右下角面板，`songVolRow()` 產生音量列）。右下角節拍器面板 `#mfPanel` 也有音量和音色，往按鈕左邊展開。常用頁節拍器音量存在 `pr_metro.vol`。`playSnd(音色, 時間, 等級, 拍, 音量%)` 用 (音量/100)^1.5 調整，`click()` 也跟著 `sndGain`。同時只會有一個在響（`songMetroOff`），常用頁節拍器、切到常用或歌唱都會讓它停。「用到的和弦」也在播放器區塊裡、段落循環下面。
   - 段落循環可以儲存並命名：設好 A、B 點後輸入名稱按「儲存段落」（沒取名就叫「段落 N」），列表點一下就跳到 A 點開始循環，✎ 重新命名、× 刪除。依音檔分開存（同一首歌的不同音檔各有自己的列表），存在 localStorage `pr_loops`（`{音檔路徑: [{n, a, b}]}`）。
   - 「小節跳轉」（播放速度下方，可折疊）：輸入小節數按「跳到」會先移到該小節開頭，用常用頁節拍器的音色敲 4 拍預備拍（依目前播放速度，顯示 ●●○○），第 5 拍開始播放；預備拍途中自己按播放或換音檔就取消，「循環這幾小節」也一樣先數預備拍（只在開始時數，之後循環不再數）；兩處各有「先數 4 拍預備拍」勾選框，所有歌曲共用，存在 `pr_countin`（`{jump, loop}`，預設都勾），下方顯示目前第幾小節第幾拍；段落循環多一列「第 a 到 b 小節」直接用小節設循環；存好的段落與循環狀態會標小節範圍。資料在 `SONGS[].audio[].bars`：`t1` 第 1 小節起點秒數、`len` 每小節秒數、`n` 小節數、`exact` 之後漸慢（剩下的小節平均分配到 `end`，顯示「約」）、`sheet` 樂譜涵蓋的小節數。數值是用 Web Audio 解碼音檔、比對拍點量出來的：所有音檔開頭都有 4 拍預備拍；組曲「含節拍器」版實測 ♩=72（已設 `bpm:72`），示範版 ♩=70；相思湖畔人聲版開頭與吉他示範對齊，共 112 小節。
   - 右下角最上面是「播放音檔」浮動按鈕（`#apFab`）：面板有歌名和音檔版本、播放／暫停、時間、目前第幾小節第幾拍，「播放速度」（滑桿 40%–125%、「原速」，就是播放器的速度，`_ctl.tempo/ratio/setRatio/origSpeed`；拖動時 250ms 的更新不會改滑桿），以及「第 □ 小節」跳轉（− / ＋、Enter 或「跳到」，可勾「先數 4 拍預備拍」，跟播放器裡的同一個設定）。下面是「段落循環」：第 □ 到 □ 小節按「循環」（同播放器的小節循環，可勾預備拍，設定共用）、循環中顯示範圍和「取消循環」、播放器裡儲存的段落列成按鈕，點一下開始循環（`_ctl.loopBars/loopInfo/clearLoop/saved/playSaved`）。注意：面板點外面會收起，所以 `_ctl` 不能用 `.click()` 觸發播放器裡的按鈕，按鈕也不能在點擊時被重建。面板太高時可以捲動。控制的是正在播放的那首，沒有在播放時是畫面中間那首（播放器用 `box._ctl` 提供控制）。播放中按鈕右上角有綠點；面板開著時每 250ms 更新一次。三個浮動面板（播放音檔、節拍器、自動捲譜）一次只開一個。
   - 右下角自動捲譜按鈕上方有「節拍器」浮動按鈕（`#mfFab`），點開面板可播放／暫停並拖動調速；控制的是正在響的那首歌的節拍器，沒有在響時是畫面中間那首（播放器以 `box._metro` 提供控制，狀態改變時發出 `pmchange` 事件）。響的時候按鈕右上角有綠點；兩個面板一次只開一個。
   - 樂譜筆記（`sheetNotes()`，開啟樂譜時建立）：樂譜上方的工具列會黏在畫面頂端，用圖示按鈕，滑鼠移上去顯示名稱：檢視、筆刷、橡皮擦、框選練習段落、上一步、下一步。最上面一行是「樂譜筆記」：點標題會收起工具，只留這一行（收起時自動切回檢視）；右邊的圖釘按鈕可以取消釘選，工具列就不再固定在畫面上方。這兩個設定所有歌曲共用，存在 `pr_sn_ui`（`{fold, unpin}`）。文字工具（T）：點譜上一處會出現輸入框，Enter 或點別處存檔，Shift+Enter 換行，Esc 取消；點已寫好的字可以修改，清空就刪除；字有白色描邊，在譜線上也看得清楚。文字也存在 ink 裡（`{k:"t", t, x, y, s, c}`，`s` 是相對頁寬的字級），上一步、下一步可以復原新增、修改和刪除。筆刷有紅、藍、綠、黑、螢光筆和細、中、粗三種粗細；橡皮擦只擦筆跡，不會擦到樂譜。工具列下方：「顯示筆記」勾選（隱藏筆記）、「下載含筆記的 PDF」（按下時才從 cdnjs 載入 jsPDF 2.5.1，每頁 A4，含筆記和框）、「清除筆記」（會先確認，框選段落保留），以及「重點段落」清單（點一下用大視窗單獨檢視裁切後的段落，可上一段／下一段，✎ 改名、框形圖示「重新框選」、× 刪除；重新框選會切回檢視、捲到那個框，框上出現 8 個把手：拖邊或角改大小、拖中間移動（不會超出頁面，最小 3%×1.5%），按框下的「完成」或再按一次圖示結束，狀態只在這次開啟期間（`adj`）；最左邊的色點可以換框的顏色，有橘、紅、藍、綠、紫、粉 6 色，新的框會自動輪流用不同顏色）。每頁圖片上蓋一層 canvas，筆跡用 0–1 的相對座標存，任何寬度都對得上。資料依歌名存在 `pr_sheet_notes`：`{歌名: {ink: {頁: [筆畫 {c, a, w, e, p}]}, boxes: [{n, pg, x, y, w, h, c}], hide}}`，橡皮擦也是一筆畫（`e:1`，用 destination-out 畫）。上一步、下一步只記這次開啟期間的筆畫。非檢視模式時 canvas 會接手觸控，所以畫面不能捲動。

**使用說明（互動導覽）**：第一次進入網頁時自動開啟，右上角「？」（`#helpBtn`）可隨時再看。聚光燈框住真的按鈕、旁邊放說明卡片（上一步／下一步／略過，Esc 關閉、左右方向鍵換步）；「動手試試」的步驟要使用者真的按下框起來的按鈕才會前進（點「歌唱」→ 點「吉他」→ 按「開啟樂譜」）。完整版與同學版各有自己的步驟（`STEPS`，同學版只介紹專案），看過與否分開記在 `pr_tour` 與 `pr_tour_class`。結束時把板塊和子分頁恢復成開始前的樣子。畫面上找不到的按鈕（例如不同版面）會自動跳過那一步。如果同時有「版本公告」（`dialog.rn`），導覽會等公告關掉後才開。

**歌唱**
1. 呼吸練習：3 種節奏（4-4-6、4-8、4-7-8），圓圈動畫引導。
2. 音高偵測器：麥克風 + 自相關法，顯示音名、Hz、音分偏差、唱名，下方有最近 8 秒的音高曲線（canvas）。
3. 目標音練習：選 Do–高 Do 其中一個目標音（可切換低八度），曲線上畫出目標線與 ±25 音分區間，計算「連續唱準秒數」與最佳紀錄。判斷時忽略八度差。
4. 參考音跟唱：Do 到高 Do，不需麥克風（跟隨低八度設定）。
5. 聽音辨唱名：先播 Do 再播目標音（勾選「隱藏提示音 Do」`pr_ear.noDo` 時不播 Do、直接播題目），選唱名並計分。音域可選「基礎（白鍵 Do–Do）」或「含升降」（加五個黑鍵，鋼琴排列）；題目可選一個音、兩個音或三個音；多個音時在 Do 之後**同時**播放（音量依音數調低），作答不分順序，再點一次可取消，選滿題目的音數後按「送出」`#earSubmit` 才對答案（一個音的題目點了就對答案），全部選對才算對。對完答案 `done=true`：紅綠標示保留、點琴鍵只發聲，「再聽一次」重播同一題，按「出題」或改設定才重置。琴鍵在畫面上時，鍵盤上排 1–8（`e.code` Digit1–8）等於點白鍵 Do…高音 Do，含升降時 Q／W／R／T／Y 是五個黑鍵（`BLACK_KEYS`，位置在兩個數字之間）（輸入框、開著的對話框、按住重複都不觸發），琴鍵上用 `kbd` 標出按鍵（觸控裝置隱藏；「在琴鍵上顯示對應的按鍵」勾選存在 `pr_ear.kbd`，取消時 `#piano.nokbd` 只隱藏標示，琴鍵長度不變（白鍵高度 `max(150px, 34cqw)` 跟著寬度等比例，約 1:2.7；黑鍵 55%），按鍵照樣有作用）。設定存在 `pr_ear`。
6. 錄音回放：同吉他。
7. 每日暖聲清單：5 項勾選清單。

## 程式結構（index.html 內 JS，單一 IIFE）
- 工具：`$`、`el`、`load/save`（localStorage，皆 try/catch）、`midiFreq/freqMidi/noteName`。
- 麥克風（調音器與音高偵測共用，一次只開一個）：`openMic/closeMic/readPitch/autoCorrelate`；調音器用 `openMic(true)`（4096 樣本、60 Hz 高通＋1.4 kHz 低通）和 `yin()`（YIN，門檻 0.15，抓不到就取 <0.3 的最低點，拋物線內插），歌唱仍用 autoCorrelate，錯誤訊息由 `micError()` 統一處理。
- 音訊：`audio()` 懶建立 AudioContext；`pluck()` 用 Karplus-Strong 合成吉他聲；`tone()` 用振盪器加包絡；`click()` 節拍器。
- 分頁：`.mode` 按鈕切換 `body[data-mode]`，CSS 變數 `--accent` 隨模式在琥珀（吉他）與鈷藍（歌唱）間切換。切換時會停止另一邊的節拍器、調音器、麥克風、呼吸練習與錄音。
- 吉他：`CH` 和弦資料表（`f` 為六弦品位，-1 不彈、0 空弦；`fg` 為手指編號；`b` 為橫按 `[品位, 起弦, 終弦]`；`s` 為圖上起始品位，品位一律寫絕對值）、`renderChord(svg, 名稱)` 可畫進任何 svg、`GROUPS`、`drawChord()`、`strum()`；調音器 `tunerLoop/startTuner/stopTuner/tunerPaint/tunerPick`（狀態 `tAuto/tSel/tCur/tCents/tTuned`）；跟拍播放 `scheduler()` 與節拍器 `mScheduler()` 都每 25ms 預排未來 120ms，UI 用 setTimeout 對齊；刷法資料 `PATS`（`beats`、`sub` 每拍格數、`slots` 為 D/U/X/空字串），`click(時間, 等級 0–2)`、`chuck()` 切音。
- 錄音：`recorder(root, 檔名前綴)` 產生元件，吉他 `recG`、歌唱 `recS`。
- 歌唱：`BREATHS`、`SCALE`、`singLoop/startSing/stopSing`、`drawCurve()`、`setTarget()`、`WHITE`／`BLACK`、`SOLF`、`answer()`。
- 子分頁：吉他分「常用／學習／專案」、歌唱分「常用／學習／專案」。歌唱的「學習」（`renderSLearn()`）最上面是「歌唱力學習地圖」（`renderSMap()`，`details.lmod#lmod-smap`，跟吉他學習地圖一樣預設收起、開關存 `pr_smap_open`）：使用者要「一篇文章就好，不要拆成好幾篇」，所以內容是一整篇 `.lart` 文章 `SMAP_BODY`（使用者要輕鬆、像部落格的口吻；根據使用者整理的しらスタ影片筆記：音準／節奏／發聲各 Level 1–3、表現力 TPO 表格、結論），最後是「去練習」按鈕（`SMAP_GO`，`sMapGo()`：歌唱常用區塊 h2、`proj` 專案、`metro` 吉他節拍器）和影片來源 `SMAP_VIDEO`（6Tp-eguoPJI）。側欄 `navTargets()` 在「學習」同時列出 `.lmod` 與 `.block`。接著是使用者挑選的別人的教學影片：`SLEARN` 依主題分組（音準、節奏、發聲三個主題，對應歌唱力學習地圖；節奏目前沒有影片，顯示「之後會補上」；每個主題是可收合的 `details.block.stopic`，預設展開，收起的記在 `pr_slearn_fold`（key 是主題名或「主題/子題」）；主題可以用 `subs:[{t, d, videos}]` 再分子題（目前發聲分「力道」「音色」），子題是可收合的 `details.ssub`；影片在 `.vgrid` 裡排成有邊框的小卡片），每個主題是一個 `.block`（側欄會列出）、每支影片一張 `.vcard`（`ytBox` 縮圖點了才播、中文標題 `zh`＋原標題、頻道與語言、推薦理由、「我看過了」存在 `pr_slearn`、`go` 是歌唱常用頁要跳去練習的區塊 h2）；`SCHANNELS` 是推薦頻道。加影片只要在 `SLEARN` 加一筆（標題與頻道可用 YouTube oEmbed 查）。，`showSub(panel, sub)` 依該面板的 `.subtab` 切換對應的 `#g-…`／`#s-…` 區塊；左側清單的 `NAV[].subs` 決定每個面板列出哪些子分頁；離開「常用」時由 `SUB_STOP` 停止該邊正在跑的東西（吉他：跟拍、節拍器、調音器、錄音；歌唱：音高偵測、呼吸、錄音）。歌唱專案的歌詞（`lyricsPanel()`）：`VSONGS[].lyrics` 指向 `songs/…-lyrics.json`，格式是 `{lines:[{t 開始秒數（影片時間）, s 歌詞, gap 新段落}]}`。歌詞放在可折疊的「歌詞」區塊，每 200ms 讀一次 YouTube 播放器的時間，唱到的那句會亮起並捲到中間；手動捲動後 3 秒內不會自動捲。點一句歌詞，影片就跳到那句前 0.3 秒播放。內建歌曲（篇章、暮色回響）的時間已由使用者對好寫在 JSON，不再顯示「對時間」，也不讀 `pr_lyric_times`。「對時間」只給自己加的歌（每句都有時間後，按鈕改叫「編輯歌詞時間軸」、放在「標記歌詞」右邊，從正在唱的那句開始 `calStart(cur)`）：從第一句前 4 秒開始播，每句開始時按按鈕或空白鍵記下時間，存在 `pr_lyric_times`（只存在這台裝置）。要再調整內建歌曲的時間，得暫時在 `renderTools()` 對內建歌曲打開「對時間」，或直接改 JSON。歌詞的 `t` 可以是 null（還沒對時間）：那句不會亮，點了會提示，區塊下方會提醒按「對時間」。目前歌曲：篇章（有主旋律 JSON，可以跟唱比對）、暮色回響（張韶涵版，原唱吉星出租，影片 tln-FPsf4tg，歌詞 `songs/muse-huixiang-lyrics.json` 共 40 句，2026-10-12 由使用者對好時間）。篇章歌詞由使用者提供，使用者決定公開放在網站上；46 句的時間已由使用者用「對時間」逐句對過（2026-10-11）。歌唱的「專案」列出 `VSONGS`（目前：篇章，YouTube 影片），`ytPlayer()` 先顯示縮圖，點了才載入 youtube-nocookie 播放器。歌曲卡片不放「在 YouTube 開啟」連結（使用者不要；歌唱學習的影片卡片和歌唱力學習地圖的影片來源也都不放）。
- 歌唱專案右下角錄音（`#vRec`，沿用 `.ascroll`／`.as-panel` 樣式，只在「歌唱 › 專案」顯示，離開就停止錄音；同學版沒有）：麥克風按鈕打開「錄音」面板，裡面是 `recorder(panel, "歌唱專案")`（跟錄音回放同一個，最多留 10 段、可下載），紅色圓鈕是 `.rec-btn`（recorder 會改它的文字，所以用 MutationObserver 看 `.rec-time.recording` 把圖示放回去、同步 aria 和按鈕上的紅點）。「開始錄音時一起播放影片」（`pr_vrec_video`，預設勾）會播放最後開始播放的影片（`ytLast`，在 `ytBox()` 的 onStateChange 記錄），停止錄音時暫停。導覽 `SSTEPS` 有一步介紹它。
- 歌唱專案導覽：跟使用說明共用同一套導覽元件（`begin(list, key)`），步驟在 `SSTEPS`（卡片、影片、歌詞、標記歌詞、自動捲動／顯示標記、跟唱比對、新增歌曲、備份按鈕、這頁怎麼用）。第一次出現「歌唱 › 專案」時自動開始（MutationObserver 看 body 的 `data-mode` 和 `#s-projects` 的 hidden；版本公告或主導覽還開著就等），看完存 `pr_tour_sproj`。結束時留在歌唱專案、捲回頁頂。右上角「？」（`#helpBtn`）在完整版會打開 `#helpMenu`（沿用 `.style-menu`／`.style-opt` 樣式，`TOURS`）選「網站導覽」（`STEPS`）、「吉他專案導覽」（`GSTEPS` = 開場 + `songSteps` + 結尾）或「歌唱專案導覽」（`SSTEPS`）；同學版按「？」直接開同學版導覽，沒有選單。
- 版本公告：`RELEASES`（script 結尾）第一筆是最新版本 `{v, title, items:[[標題, 說明]]}`。更新後第一次開啟網頁會跳出對話框（`<dialog class="rn">`），按「我知道了」或 Esc 關閉並把 `v` 存到 `pr_seen_ver`，之後不再出現。第一次來的訪客（載入前沒有任何 `pr_` 開頭的 localStorage，由最前面的 `RETURNING` 判斷）不顯示。同學版也會顯示。**每次有使用者看得到的更新都要在 `RELEASES` 最上面加一筆新的公告**（使用者要求自動產生）。`v` 用日期，同一天第二次更新寫 `.2`、`.3`…（畫面只顯示日期）；沒加新的就不會再跳。跟吉他專案有關的公告要加 `class:true`，同學版（讚頌吉他班）只會顯示有這個標記的最新一則，已讀紀錄另外存在 `pr_seen_ver_class`；以前在同學版看過的（舊的共用 `pr_seen_ver`）也算已讀。唱歌等其他更新不加，同學版就不會看到。對話框共用 `sheetDialog(小字, 標題, 內容, 按鈕, onClose)`。
- 回報問題（**待辦：收件信箱還沒決定**）：側欄最底下的「回報問題」（`#navFoot`、`openReport()`）會開對話框寫問題，按「用 Email 寄出」以 mailto 開郵件程式，自動附上目前頁面、網站版本、瀏覽器與螢幕大小。`CONTACT_EMAIL` 目前是空字串，所以入口隱藏；填入信箱後就會出現（信箱會公開在網站與倉庫上）。
- 跟唱比對（`karaPanel()`）：歌曲有 `melody` 時出現，包在可折疊的「跟唱比對」區塊（`foldSection("kara", …)`，預設收起（`FOLD_DEF`），使用者展開或收起後的狀態跟歌詞一樣存在 `pr_card_fold`，所有歌一起；自己的歌還沒建立旋律時，`melSetup()` 也在同一個區塊）。canvas 用 ResizeObserver 在展開後重畫。用 YouTube IFrame API 的 `getCurrentTime()` 當時間軸，目標音符來自 `songs/*-melody.json`（`notes: [[開始秒, 長度秒, MIDI]]`），麥克風音高摺到目標的八度後比對，±50 音分算準；計分以時間加權、每個音前 80ms 不計；可升降 Key（±7）；停止後列出最不準的音，點了跳回前 2 秒。
- 篇章的旋律是從原曲錄音自動辨識（Melodia 式諧波顯著度 + Viterbi 追蹤，濾掉 C3 以下的貝斯），378 個音、B 大調、調音偏差約 +1 音分，可能有錯音或漏音。原曲 MP3 只在使用者電腦，不進倉庫。
- 自己加的歌（`pr_my_songs`：`[{id, title, by, yt, lines:[{s, gap}], tags:[…], mel:{key, notes, off, src}}]`）：唱歌 › 專案最下面「＋ 新增歌曲」（`songForm()`）填歌名、演唱者（可空）、標籤（卡片標題下那排，最多 6 個、每個 12 字，輸入後按「加入」或 Enter，、或逗號可一次加多個，× 刪除；新歌預設「自己加的歌」，舊資料沒有 `tags` 也顯示這個，`songTags()`）、YouTube 連結（`ytId()` 接受 watch?v=、youtu.be、shorts、embed、live 或 11 碼 ID；表單第一欄，貼上後 400ms 用 YouTube oEmbed（`ytInfo()`，有 CORS、不用伺服器）查影片標題，`parseYtTitle()` 拆出歌名／演唱者：「歌手 - 歌名」、「歌手【歌名】」、「… - Topic」頻道，去掉【高音質|動態歌詞】之類的標註；只填空著或上次自動填的欄位，下面顯示原始標題。頻道名不當演唱者用。歌詞不自動抓：有版權，KKBOX 條款也禁止爬取。新增表單裡有「在 YouTube 頁面一鍵帶入（電腦版）」摺疊區，放書籤小工具 `BML`（javascript: 連結，拖到書籤列；在 YouTube 影片頁用 `movie_player.getPlayerResponse().videoDetails` 讀 id、標題、頻道、說明欄前 6000 字，開新分頁到本站 `#yt=<json>`）。`importYt()`（載入時與 hashchange）清掉 hash、切到歌唱 › 專案、開 `songForm(null, pre)` 預填；`findLyrics()` 從說明欄找最長一段短行（≤40 字，排除網址、@、#、冒號、版權／訂閱等字，段內最多 2 行空白，至少 6 句）當歌詞。同學版不處理。留言區不抓）和歌詞（`parseLyrics()`：一行一句，空行＝新段落 `gap`）。卡片由 `songCard()` 產生，內建 `VSONGS` 與自己的歌共用；卡片分成標題區 `.song-h`（歌名、演唱者、標籤＋右邊箭頭 `.song-fold`）和內容 `.song-b`，按標題或箭頭收起／展開，每首歌各自記在 `pr_vsong_fold`（key 同 `lyrKey()`），收起時停掉這張卡的跟唱比對、暫停影片；歌唱專案導覽的 `toSProj()` 會先展開第一張；自己的歌有「✎ 編輯歌曲」「× 刪除」（sheetDialog 確認）。歌詞時間存在 `pr_lyric_times["my:<id>"]`（`lyrKey()`），沒有「複製時間」也沒有「清除時間」（使用者不要），重對就用「編輯歌詞時間軸」；編輯歌詞時句數相同就保留全部時間，否則只保留頭尾沒變的句子（`remapTimes()`）。歌詞下方「自動捲動」勾選框所有歌共用，存在 `pr_lyr_auto`。
- 歌詞標記（所有歌都能用）：「標記歌詞」進入標記模式（`mk`，不跳影片、不自動捲），每句拆成一個字一個 span（`paint()`，用 code point 算位置）；點一個字選取，再點同一句另一個字選一段（`pick()`）。上方工具列（`markBar()`）：顏色標籤（預設 g 有力、y 溫柔、b 哭腔、o 重音）、底線、符號標籤（預設 ⤴ 滑上去、⤵ 滑下來、～ 拉長音、/ 換氣、(V) 抖音、🔁 轉音）、「＋ 文字」（自訂，最多 12 字）、「清除標記」；同一顏色或符號再按一次就取消。符號放在選取範圍的後面。資料存在 `pr_lyric_marks`：`{歌詞key: {句: {c:[[起, 迄, 顏色]], u:[[起, 迄]], s:[[位置, 文字]]}}}`（位置 p 表示第 p-1 個字後面）。平常模式下歌詞上方列出所有標籤（不管這首歌有沒有用到，`showLegend()`），最後有「✎ 編輯標籤」（工具列也有）。標籤所有歌共用，存在 `pr_mk_tags`（`{c:[{id, n, bg}], s:[{t, n}]}`，預設 `MK_DEF`）；`editMkTags()` 對話框可以改名稱、用色票改顏色（文字顏色依亮度自動黑或白，`mkFg()`）、改符號、新增（顏色最多 8、符號最多 12）、刪除、恢復預設。儲存時：刪掉的顏色 id／符號會從所有歌的標記移除（有用到會先 confirm 顯示處數），改過的符號文字會把所有標記一起換掉，然後每個歌詞面板 `_reload()`。歌詞下方有「顯示標記」勾選框（所有歌共用，`pr_lyr_marks_show`），關掉時只顯示純文字、不顯示圖例；標記模式中一律顯示。編輯自己的歌時，只保留文字沒變的句子的標記（`lineMap()`）；刪歌時一起刪。
- 自己的歌的跟唱比對：沒有旋律時顯示 `melSetup()`：上傳音檔 → `extractMelody()` 在瀏覽器裡辨識（16 kHz 解碼、20 ms 一格、Hann 視窗 FFT、頻譜峰值的諧波加總顯著度（10 個諧波、0.8 衰減、10 音分一格、A2–C6），Viterbi 每跳一格扣固定分數，用路徑顯著度與音量判斷有沒有唱，再以 0.75 半音遲滯切成音符，最短 80 ms）；`guessKey()` 用 Krumhansl 調性輪廓猜調。接著對齊：音檔第一句按一下（`tA`），影片第一句用歌詞第一句的時間或自己按（`tV`），`off = tV − tA`，第一句前 1.5 秒以前的音丟掉（前奏）。音檔不保存，只存音符（音檔時間）和 `off`；`myMelData()` 加上 off 給 `karaPanel()`。跟唱時下方「◀ 早一點／晚一點 ▶」每次 0.05 秒調 off（`melOffRow()`），「重新建立旋律」刪掉旋律回到上傳。用專案裡的相思湖畔人聲檔測試約 4 秒、488 個音。
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
- 調音器改用 YIN 後，強 2 次泛音的低音弦測試沒有抓成高八度；實機（手機麥克風、吵雜環境）還沒大量測過。
- 和弦圖只顯示 1–5 格，更高把位的和弦需要加「起始品位」欄位。
- 分頁在背景時瀏覽器會降低計時器頻率，節拍器會暫停跳拍（回到前景後自動接上，不會補一堆拍子）。
- 錄音不會持久保存，重新整理就消失。
- 沒有自動化測試。
- 進度只存在單一瀏覽器，不跨裝置；右上角「資料備份」（`backupDialog()`，同學版不顯示）可以把所有 `pr_` 開頭的 localStorage 匯出成 JSON（`{app:"practice-room", ver:1, at, data:{key: 原字串}}`），匯入時確認後整批取代並重新整理，寫入失敗會還原。
- **會員同步（Supabase）**：右上角人像按鈕（`#acctBtn`，完整版和同學版共用同一套會員和同一份資料；`SUPA_URL`／`SUPA_KEY` 常數空白時不顯示）。登入方式：Email＋密碼，Supabase 關閉 Confirm email，所以完全不寄信（見 ADR-0003）；忘記密碼由管理員在 Authentication › Users 重設。登入後除了外觀設定（`pr_theme`、`pr_style`，每台裝置各自保留，見 `DEVICE`）以外的所有 `pr_` 鍵以一筆 JSON 存在 `user_data` 表（每位會員一筆），`save(k,v)` 會呼叫 `syncHook(k)`（外觀設定不觸發），修改 4 秒後自動上傳，切到背景也會上傳；回到分頁時檢查雲端是否較新（會先詢問再重新整理）。同步記錄用 `prsync_uid`／`prsync_at`／`prsync_dirty`，登入狀態存在 `prsync_auth`（都不是 `pr_` 開頭，不會進備份或雲端）。只有一邊改過就以那邊為準；兩邊都改過、或第一次在已有資料的裝置登入，會跳出「要保留哪一份」讓使用者選。登出（`outDialog`）可選「資料留在這台裝置」或「從這台裝置清除」，先同步未上傳的修改，用 `signOut({scope:"local"})` 只登出這台。刪除會員（`deleteDialog`，要輸入「刪除」）呼叫資料庫函式 `delete_me()`，`user_data` 跟著 cascade 刪除，這台裝置的練習資料保留。supabase-js 從 jsDelivr 延遲載入（固定 2.117.2，支援新的 Publishable key）。
  - 正式專案：`practice-room`（ref `dfggqpukvgxdoojayjxc`，東京），2026-10-14 已套用下面的 SQL（migration：create_user_data、revoke_rls_auto_enable_from_api、create_delete_me）。重建時在 SQL Editor 執行：
    ```sql
    create table public.user_data (
      user_id uuid primary key references auth.users on delete cascade,
      data jsonb not null default '{}',
      updated_at timestamptz not null default now()
    );
    alter table public.user_data enable row level security;
    create policy "own row read" on public.user_data for select to authenticated using ((select auth.uid()) = user_id);
    create policy "own row insert" on public.user_data for insert to authenticated with check ((select auth.uid()) = user_id);
    create policy "own row update" on public.user_data for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
    revoke all on public.user_data from anon;
    grant select, insert, update on public.user_data to authenticated;
    -- Supabase 建專案時附帶的函式，不需要開放給網頁呼叫
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
    -- 會員刪除自己（user_data 跟著 cascade）；安全檢查會提醒 authenticated 可執行 SECURITY DEFINER，這是刻意的
    create or replace function public.delete_me() returns void language plpgsql security definer set search_path = '' as $$
    begin
      if (select auth.uid()) is null then raise exception 'not signed in'; end if;
      delete from auth.users where id = (select auth.uid());
    end; $$;
    revoke execute on function public.delete_me() from public, anon;
    grant execute on function public.delete_me() to authenticated;
    ```
  - **錄音保存**：`recorder()` 錄完交給 `keep()`。沒登入存在這台裝置的 IndexedDB（資料庫 `pr_recs`、store `recs`：`{id, src, at, secs, type, blob}`，`recDB`）；登入（會員程式在 onAuthStateChange 設 `recCloud={sb, uid}`）存到 Supabase Storage 私有 bucket `recordings`，路徑 `<uid>/<毫秒時間>-<src>-<十分之一秒>.<ext>`（src：g 吉他常用、s 歌唱常用、v 歌唱專案，`REC_SRC`），檔名就帶著來源和長度，不另開資料表。每位會員最多 `REC_MAX`＝20 段（policy 也擋）。上傳失敗（存滿或網路）就先存在裝置，之後可按「存到雲端」。清單顯示裝置＋雲端兩種（標「這台裝置」／「雲端」），雲端的用 1 小時簽名網址播放、下載用 `createSignedUrl(…,{download})`；刪除要確認。登出選「從這台裝置清除」會清 IndexedDB；刪除會員前先 `recClearCloud()` 刪掉雲端錄音（檔案不會跟著帳號 cascade）。錄音不在 `pr_` 快照、備份檔裡。正式專案 2026-10-14 已套用（migration：create_recordings_bucket），重建時在 SQL Editor 執行：
    ```sql
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('recordings', 'recordings', false, 20971520, array['audio/webm','audio/mp4','audio/ogg','audio/x-m4a','audio/mpeg']);
    create or replace function public.rec_count() returns int language sql stable security invoker set search_path = '' as $$
      select count(*)::int from storage.objects
      where bucket_id = 'recordings' and (storage.foldername(name))[1] = (select auth.uid()::text)
    $$;
    revoke execute on function public.rec_count() from public, anon;
    grant execute on function public.rec_count() to authenticated;
    create policy "rec own read" on storage.objects for select to authenticated
      using (bucket_id = 'recordings' and (storage.foldername(name))[1] = (select auth.uid()::text));
    create policy "rec own insert" on storage.objects for insert to authenticated
      with check (bucket_id = 'recordings' and (storage.foldername(name))[1] = (select auth.uid()::text) and public.rec_count() < 20);
    create policy "rec own delete" on storage.objects for delete to authenticated
      using (bucket_id = 'recordings' and (storage.foldername(name))[1] = (select auth.uid()::text));
    ```
  - Authentication › Sign In / Providers › Email：保持啟用，**關閉 Confirm email**（內建寄信服務只寄給專案成員、每小時 2 封，不能給一般會員用）。
  - Project Settings › API Keys：網頁用 **Publishable key**（`sb_publishable_…`）填進 `SUPA_KEY`；Secret key 和舊的 service_role 絕對不能放進網頁。舊的 anon key 預計 2026 年底停用。
  - 免費方案：一週沒活動專案會暫停（要到後台恢復），沒有自動備份。檔案空間 1 GB、流量每月 10 GB（5 GB 有快取＋5 GB 沒快取），錄音約每分鐘 0.5–1 MB。

## 建議下一步
（已完成：GitHub Pages 部署、lookahead 節拍器、麥克風調音器、音高曲線與目標音練習、和弦擴充與橫按線、錄音回放。）
1. 做成 PWA（manifest + service worker）以便離線使用，並自帶字型。
2. 和弦圖支援起始品位，加入更多高把位和弦；節奏型態可選擇。
3. 程式規模變大時，改用 Vite 並拆成模組（audio、guitar、singing、storage）。

## 給 Claude Code 的起始提示（可直接貼上）
> 請閱讀 `HANDOFF.md` 與 `index.html`。這是一個繁體中文的吉他與歌唱互動學習網頁。先用 `python3 -m http.server` 跑起來確認可用，然後從「建議下一步」的第 1 項開始，一次做一項，每項完成後讓我確認再繼續。保持單一檔案架構，除非我同意才拆分模組。
