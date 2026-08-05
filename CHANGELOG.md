# Changelog

Mỗi version đều có git tag (`git show v1.1.0`) và zip lưu trong `releases/`.

---

## 1.1.0 — 2026-08-05

### Thêm mới

**Công tắc bật/tắt icon hover**
Switch **Hover icons** ở header dashboard. Tắt là icon Download/Save biến mất khỏi
mọi trang **ngay lập tức, không cần reload tab**. Extension vẫn chạy đầy đủ —
menu chuột phải và dashboard không bị ảnh hưởng, nên tắt icon không đồng nghĩa
mất tính năng.

**Menu chuột phải**
```
Image Collector ▸ Download original image
                ▸ Save to collection ▸ [Default / folder của bạn / …]
```
Submenu folder tự đồng bộ với các folder tạo trong dashboard.

Menu **không** tải thẳng URL mà trình duyệt báo cáo cho ảnh — trên Amazon/Etsy đó
là thumbnail đang hiển thị. Thay vào đó content script phân giải ảnh gốc từ chính
DOM của trang, dùng lại đúng bộ quy tắc của nút hover.

Menu đăng ký ở cả context `image` lẫn `link`, vì trang dạng lưới sản phẩm thường
phủ một thẻ `<a>` trong suốt lên ảnh — khi đó trình duyệt coi là link chứ không
phải ảnh.

**Truy nguồn ảnh đã lưu**
- Badge domain bấm được ở góc dưới-trái mỗi card, mở lại đúng trang nguồn
- Ô search lọc được theo domain (ví dụ gõ `etsy.com`)
- Mỗi file ZIP xuất ra kèm `sources.csv`: filename, title, folder, source_domain,
  source_url, saved_at — CRLF + BOM UTF-8 để Excel mở đúng tiếng Việt

> Dữ liệu `sourceUrl`/`sourceDomain` đã được ghi từ v1.0.0 nhưng chưa bao giờ hiển
> thị. Vì vậy **bộ sưu tập cũ hiện nguồn ngay sau khi cập nhật**, không cần
> migrate hay lưu lại.

### Thay đổi
- Logo mới cho toàn bộ kích thước icon (16/32/48/128 + 64/300 cho store)
- Nhãn version trong popup đọc từ manifest, không còn hardcode

### Quyền
- Thêm `contextMenus` — chỉ để tạo mục menu chuột phải. Không đọc thêm nội dung
  trang, không cần host permission mới.

---

## 1.0.1

Bản build Chromium hợp lệ đầu tiên. Không đổi tính năng so với 1.0.0.

- Sửa lỗi khiến Opera v1.0.0 trượt duyệt: manifest Gecko (`background.scripts`)
  bị nộp lên store Chromium nên service worker không chạy. Bản Chromium dùng
  `background.service_worker`.
- **Store:** Edge approved · Opera chờ duyệt

---

## 1.0.0

Bản phát hành đầu tiên.

- Hover lên ảnh để Download hoặc Save vào folder tuỳ chỉnh
- Trích ảnh gốc độ phân giải cao từ `srcset` / `data-src` / tham số CDN, có quy
  tắc riêng cho Amazon (`data-old-hires`, `data-a-dynamic-image`) và Etsy
  (`il_fullxfull`)
- Dashboard quản lý folder, tìm kiếm, chọn nhiều ảnh
- Tải hàng loạt thành một file `.zip` (ZIP writer tự viết, không dùng thư viện ngoài)
- UI overlay đặt trong Shadow DOM nên CSS của trang không làm méo icon
- Bỏ qua trình phát video (YouTube…) để không hiện icon nhầm chỗ
- **Store:** Firefox approved
