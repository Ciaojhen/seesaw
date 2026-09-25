# Seesaw 觀影筆記

記錄看過的電影、影集和觀後心得的手機 App（PWA）。

👉 **App 網址：https://ciaojhen.github.io/seesaw/**

不需要上架 App Store，用瀏覽器打開後「加入主畫面」就能像 App 一樣使用，沒網路也能開。

## 功能
- **看過**：海報牆，依月份分組；可篩選最愛、類型，或依評分排序；搜尋片名、標籤、和誰看
- **心得**：半顆星評分、看完的心情、一句話短評、觀後心得（可標記含劇透，打開時先模糊）、印象最深的台詞、標籤
- **海報／票根**：拍照或從相簿選，自動壓縮
- **想看**：想看清單，看完按「✓ 看完了」直接寫心得
- **統計**：每年看了幾部、平均評分、每月部數、評分分布、類型、在哪裡看、常用標籤、最常一起看的人
- **分享**：把心得轉成文字，貼到 LINE 或 IG（含劇透的心得不會被分享出去）
- **備份 / 還原**：匯出成 JSON 檔（含海報照片）

## 資料存在哪？

用 Google 帳號登入後，心得和照片存在 **Supabase** 雲端資料庫（和 CutiCuti、FooooooD 共用同一個專案，資料表分開），手機和電腦自動同步。
每次修改會先存在手機上，再在背景上傳，所以**沒網路時也能新增、修改**，連上網路後會自動上傳。

- 資料庫設定：`supabase/setup.sql`（在 Supabase 的 SQL Editor 執行）
- 連線設定：`config.js`（只放 Project URL 和 Publishable key，**不要放 secret key**）
- Supabase → Authentication → URL Configuration → Redirect URLs 要加入 App 網址

## 在電腦上預覽
```bash
npx http-server -p 5174 -c-1
```
然後打開 http://localhost:5174

## 放到手機上
- **iPhone**：用 Safari 開啟 App 網址 → 分享按鈕 → 「加入主畫面」
- **Android**：用 Chrome 開啟 → ⋮ → 「安裝應用程式」

## 更新程式後
修改 `sw.js` 裡的 `CACHE` 版本號（例如 `seesaw-v6` → `seesaw-v7`），推上 GitHub 即可。
