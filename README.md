# Image Downloader & Collector — dự án extension đa trình duyệt

Extension backlink asset cho **tshirtsiwant.com**. Code giống hệt nhau giữa các
trình duyệt; **chỉ khác `manifest.json`** theo engine.

## ⚠️ Quy tắc số 1: chỉ sửa code trong `src\`

Trước đây dự án có 2 bản sao source (`chromium\` và `firefox\`) phải sửa song song.
**Không còn nữa.** Giờ chỉ có một nguồn duy nhất và `build.ps1` tự sinh manifest
riêng cho từng store.

## Cấu trúc

| Đường dẫn | Vai trò |
|---|---|
| `src\` | **Nguồn duy nhất.** Toàn bộ code + icon đóng gói. Sửa ở đây. |
| `manifest.base.json` | Field manifest **dùng chung**: version, permissions, name, action… |
| `targets\chromium.json` | Phần đè riêng cho Chromium: `background.service_worker` |
| `targets\firefox.json` | Phần đè riêng cho Gecko: `background.scripts` + `browser_specific_settings` |
| `build.ps1` | Merge base + target → `manifest.json`, đóng gói vào `dist\` |
| `dist\` | Output build. **Gitignored, tái sinh được, đừng sửa tay.** |
| `releases\` | Zip của các version đã ship, giữ để trace back (xem `releases\README.md`) |
| `store-assets\` | Ảnh listing, screenshot, promo. **KHÔNG** đóng vào zip |
| `design\icon.svg` | File nguồn của logo; icon PNG được render ra từ đây |

Merge là **shallow** ở cấp key top-level. Hai manifest chỉ khác nhau ở
`background` và `browser_specific_settings` — đều là key top-level — nên vậy là đủ
và kết quả dễ soát.

## Nguyên tắc vàng

> **Chromium (Chrome/Edge/Opera/Brave) BẮT BUỘC `background.service_worker`.**
> Nộp bản `background.scripts` (bản Firefox) lên store Chromium → service worker
> không chạy → trượt duyệt. Đây chính là lỗi đã xảy ra với Opera v1.0.0.

Cấu trúc `targets\` sinh ra chính là để **lỗi này không lặp lại được nữa**: không
còn thao tác chọn thủ công "lấy thư mục nào", build script tự gắn đúng khối
`background` cho từng store.

## Build

```powershell
.\build.ps1                                  # build cả 2 target
.\build.ps1 -Target chromium                 # chỉ 1 target
.\build.ps1 -Target firefox -Version 1.0.0   # dựng lại một bản cũ
```

Một gói `chromium` dùng chung cho **Chrome + Edge + Opera + Brave**;
gói `firefox` cho **AMO**.

`-Version` chỉ đổi version đóng vào gói, **không** sửa `manifest.base.json`.

## Quy trình phát hành

1. Sửa code trong `src\`
2. Bump `version` trong **`manifest.base.json`** (một chỗ duy nhất cho mọi store)
3. `.\build.ps1`
4. Load `dist\` vào trình duyệt, test thật
5. Nộp store
6. Copy zip đã nộp sang `releases\v<version>\`, commit, rồi `git tag v<version>`

> Store từ chối version trùng bản đã submit — luôn bump trước khi nộp lại.

## Trạng thái store (cập nhật 2026-08-05)

| Store | Engine | Version live | Trạng thái |
|---|---|---|---|
| Firefox AMO | Gecko | 1.0.0 | ✅ Approved |
| Edge | Chromium | 1.0.1 | ✅ Approved |
| Opera | Chromium | — | ⏳ 1.0.1 awaiting moderation |
| Chrome Web Store | Chromium | — | Chưa nộp |

## Việc còn lại

1. **Chờ Opera duyệt xong 1.0.1** rồi mới nộp 1.1.0 (tránh chồng hàng đợi).
2. Chrome Web Store: nộp bản chromium. Cần chuẩn bị phần giải trình quyền
   `<all_urls>` (đọc DOM mọi trang để phát hiện `<img>`/`srcset` cho tính năng
   hover-save) + link privacy policy (khai "không thu thập dữ liệu").
3. Firefox AMO: đang ở 1.0.0, nên cập nhật lên bản mới nhất.
