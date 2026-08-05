# Image Downloader & Collector — Quản lý build đa trình duyệt

Extension backlink asset cho **tshirtsiwant.com**. Code giống hệt nhau giữa các
trình duyệt; **chỉ khác `manifest.json`** theo engine.

## Cấu trúc

| Thư mục | Dùng cho | Điểm khác trong manifest |
|---|---|---|
| `chromium/` | **Chrome, Edge, Opera, Brave** | `background.service_worker`, **không** có `gecko`. Tên phải ≤ **45 ký tự** (giới hạn Chromium) |
| `firefox/` | **Firefox (AMO)** | `background.scripts` + `browser_specific_settings.gecko` |
| `store-assets/` | Ảnh cho trang listing (screenshot, promo, icon300), README cũ, script generate | **KHÔNG** đóng vào zip |
| `dist/` | Các zip đã build sẵn để upload | Chỉ chứa 11 file extension thật |

## Nguyên tắc vàng

> **Chromium (Chrome/Edge/Opera/Brave) BẮT BUỘC `service_worker`.**
> Nộp bản `background.scripts` (bản Firefox) lên store Chromium → service worker
> không chạy → trượt duyệt. Đây chính là lỗi đã xảy ra với Opera v1.0.0.

## Trạng thái store (cập nhật 2026-08-03)

| Store | Engine | Version live | Trạng thái |
|---|---|---|---|
| Firefox AMO | Gecko | 1.0.0 | ✅ Approved |
| Opera | Chromium | — | ❌ Đã nộp **nhầm bản Firefox** → kẹt "Awaiting moderation" từ 2026-07-24. Cần rút/thay bằng `dist/ImageCollector-chromium-v1.0.1.zip` |
| Edge | Chromium | — | ❌ Cùng lỗi như Opera. Nộp lại bản chromium v1.0.1 |
| Chrome Web Store | Chromium | — | Chưa nộp. Dùng bản chromium v1.0.1 |

## Build lại zip

Chỉnh code trong `chromium/` hoặc `firefox/`, rồi chạy `build_zips.ps1`
(tách file set sạch, path POSIX dấu `/`). Nhớ **bump `version`** trong manifest
trước khi nộp lại — Opera/Edge từ chối version trùng bản đã submit.

## Việc còn lại

1. Opera: mở dashboard → thay version bằng `dist/ImageCollector-chromium-v1.0.1.zip`.
2. Edge Partner Center: nộp `dist/ImageCollector-chromium-v1.0.1.zip`; điền phần
   giải trình quyền `<all_urls>` (đọc DOM mọi trang để phát hiện `<img>`/`srcset`
   cho tính năng hover-save) + link privacy policy (khai "không thu thập dữ liệu").
3. (Tuỳ chọn) Chrome Web Store: nộp cùng bản chromium.
