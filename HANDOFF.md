# 彈唱練習室 — 開發交接文件

## 專案目標
互動式學習網頁，分兩大板塊：**吉他學習**與**歌唱學習**。繁體中文（zh-Hant），主要在手機 Chrome 使用。

## 目前狀態
- 單一檔案 `index.html`（HTML + CSS + JS 全部內嵌，無建置流程、無相依套件）。
- 唯一外部資源：Google Fonts（Noto Sans TC、Noto Serif TC），有備援字型。
- 已在 Claude 內嵌預覽發佈過，但**內嵌環境擋麥克風**，所以音高偵測只能在真正的 https 或 localhost 運作。計畫部署到 GitHub Pages。

## 本機執行
```
python3 -m http.server 8000
# 開 http://localhost:8000
```
localhost 屬於安全環境，`getUserMedia` 可正常跳出麥克風詢問。用手機測試時需 https（可用 GitHub Pages 或 ngrok）。

## 功能清單
**吉他**
1. 和弦圖與試聽：C G D A E Em Am Dm F。SVG 動態繪製指法，刷下、刷上、逐弦彈。
2. 標準調音：六條弦參考音（E A D G B E）。
3. 跟拍換和弦：4 組和弦進行、節拍器、八分音符刷弦節奏圖（↓ · ↓ ↑ · ↑ ↓ ↑）、50–140 BPM。
4. 入門路線：5 項勾選清單。

**歌唱**
1. 呼吸練習：3 種節奏（4-4-6、4-8、4-7-8），圓圈動畫引導。
2. 音高偵測器：麥克風 + 自相關法，顯示音名、Hz、音分偏差、唱名。
3. 參考音跟唱：Do 到高 Do，不需麥克風。
4. 聽音辨唱名：先播 Do 再播目標音，選唱名並計分。
5. 每日暖聲清單：5 項勾選清單。

## 程式結構（index.html 內 JS，單一 IIFE）
- 工具：`$`、`el`、`load/save`（localStorage，皆 try/catch）。
- 音訊：`audio()` 懶建立 AudioContext；`pluck()` 用 Karplus-Strong 合成吉他聲；`tone()` 用振盪器加包絡；`click()` 節拍器。
- 分頁：`.mode` 按鈕切換 `body[data-mode]`，CSS 變數 `--accent` 隨模式在琥珀（吉他）與鈷藍（歌唱）間切換。切換時會停止節拍器、麥克風、呼吸練習。
- 吉他：`CH` 和弦資料表（`f` 為六弦品位，-1 不彈、0 空弦；`fg` 為手指編號）、`drawChord()`、`strum()`、`PROGS`、`PAT`、`step()` 排程。
- 歌唱：`BREATHS`、`autoCorrelate()`、`startMic/stopMic/loop`、`KEYS`、`answer()`。
- localStorage 鍵：`pr_guitar`、`pr_singing`（皆為布林陣列）。

## 設計決策
- 色彩用 CSS 變數，含淺色與深色（`prefers-color-scheme` + `data-theme`）。
- 標題用 Noto Serif TC，內文用 Noto Sans TC。
- 版面寬度上限 880px，手機優先，加入 safe-area 內距。
- 尊重 `prefers-reduced-motion`。
- 音訊必須由使用者操作後才啟動（瀏覽器限制）。

## 已知問題與限制
- 節拍器用 `setInterval` 排程，長時間可能有些微飄移；建議改成 Web Audio 向前預排（lookahead scheduler）。
- 音高偵測只適合單音；音量太小、背景吵或高音區會不穩。
- F 和弦只畫圓點，沒有畫橫按的封閉線。
- 調音區只有參考音，沒有用麥克風判斷你的吉他是否準。
- 沒有自動化測試。
- 進度只存在單一瀏覽器，不跨裝置。

## 建議下一步
1. 部署到 GitHub Pages（檔名 `index.html`，Settings → Pages → main / root）。
2. 節拍器改用 lookahead scheduler。
3. 新增麥克風調音器（沿用 `autoCorrelate`，顯示最接近的吉他弦與偏差）。
4. 音高偵測加入即時音高曲線圖（canvas），並加入目標音練習模式。
5. 擴充和弦（7th、sus、封閉和弦）與更多和弦進行；F 和弦畫橫按線。
6. 加入錄音與回放（MediaRecorder）。
7. 做成 PWA（manifest + service worker）以便離線使用，並自帶字型。
8. 程式規模變大時，改用 Vite 並拆成模組（audio、guitar、singing、storage）。

## 給 Claude Code 的起始提示（可直接貼上）
> 請閱讀 `HANDOFF.md` 與 `index.html`。這是一個繁體中文的吉他與歌唱互動學習網頁。先用 `python3 -m http.server` 跑起來確認可用，然後從「建議下一步」的第 2 項開始，一次做一項，每項完成後讓我確認再繼續。保持單一檔案架構，除非我同意才拆分模組。
