# Image Downloader & Collector — Product Source of Truth

> **Đây là nguồn duy nhất** để viết blog, mô tả store, landing page, social post.
> Mọi nội dung marketing về extension phải lấy từ file này. Khi tính năng thay đổi,
> **sửa ở đây trước**, rồi mới copy đi nơi khác.
>
> Cập nhật cho **v1.1.0** — 2026-08-05
> Tài liệu liên quan: [`CHANGELOG.md`](CHANGELOG.md) · [`store-assets/README.md`](store-assets/README.md) (giải trình quyền cho reviewer)

---

## 1. Định vị sản phẩm

**Tên đầy đủ:** Image Downloader & Collector - Batch Save
**Tên rút gọn (dùng trong UI, menu chuột phải):** Image Collector
**Nhà phát hành:** Tshirts I Want — https://tshirtsiwant.com/
**Nền tảng:** Chrome · Microsoft Edge · Opera · Brave · Firefox
**Kỹ thuật:** Manifest V3

### One-liner
> Save and batch-download the **original** image behind any thumbnail — organised into folders, with every source URL kept.

### Elevator pitch (2 câu)
> Image Collector lets you hover or right-click any image on the web to download the true original file — not the compressed thumbnail the page is showing you. Save images into custom folders as you browse, then export an entire collection as a single ZIP with a CSV of where every image came from.

### Điểm khác biệt cốt lõi
Hầu hết extension tải ảnh đều lấy đúng cái URL trang đang hiển thị — tức là thumbnail.
Image Collector **phân giải ảnh gốc từ DOM của trang**, có quy tắc riêng cho từng site lớn.
Đây là thứ nên nhấn mạnh trong mọi bài viết: **"original, not thumbnail"**.

---

## 2. Đối tượng người dùng

| Nhóm | Nhu cầu | Thông điệp phù hợp |
|---|---|---|
| **Print-on-demand seller / T-shirt designer** | Gom mockup, nghiên cứu design đang bán chạy trên Etsy/Amazon | "Research competitor listings without losing track of where each design came from" |
| **Graphic designer / illustrator** | Dựng mood board, thư viện tham khảo | "Build a reference library that still remembers its sources" |
| **Marketer / content creator** | Gom asset cho bài viết, social | "Collect now, download the whole set as one ZIP later" |
| **Người mua sắm / so sánh sản phẩm** | Lưu ảnh sản phẩm chất lượng cao | "Get the full-resolution product photo, not the listing thumbnail" |

---

## 3. Tính năng đầy đủ

### 3.1 Tải ảnh gốc — tính năng lõi
Khi tải, extension **không** dùng URL đang hiển thị mà truy ngược ảnh gốc theo thứ tự:

1. **Quy tắc riêng cho Amazon** — đọc `data-old-hires` và `data-a-dynamic-image`
   (chọn ảnh có diện tích lớn nhất), đồng thời gỡ các hậu tố kích thước trong đường
   dẫn (`._AC_SL1500_.jpg` → `.jpg`)
2. **Quy tắc riêng cho Etsy** — nâng cấp `il_570xN.` → `il_fullxfull.`
3. **Thuộc tính data-*** — `data-src`, `data-original`, `data-high-res`, `data-full-url`,
   `data-zoom-image`, `data-src-large`, `data-actualsrc`, `data-old-hires`
4. **`srcset`** — chọn ứng viên độ phân giải cao nhất
5. **Thẻ `<a>` cha** nếu nó trỏ tới file ảnh
6. **`currentSrc` / `src`**, sau khi gỡ tham số kích thước của CDN
   (`w`, `width`, `h`, `height`, `resize`, `size`, `fit`, `dpr`, `crop`, `thumbnail`…)
7. **`background-image`** trong CSS, cho ảnh không nằm trong thẻ `<img>`

> **Cẩn trọng đáng nói trong bài viết:** với URL có chữ ký số (`sig`, `token`,
> `expires`, `hmac`, `policy`…), extension **không** đụng vào tham số — vì sửa sẽ
> làm hỏng link. Đây là chi tiết cho thấy sản phẩm được làm cẩn thận.

### 3.2 Ba cách thao tác

| Cách | Thao tác | Ghi chú |
|---|---|---|
| **Hover** | Rê chuột lên ảnh → 2 icon tròn hiện ở góc trên-phải | Chỉ hiện với ảnh từ **60×60 px** trở lên, tránh làm phiền ở icon/logo nhỏ |
| **Chuột phải** | `Image Collector ▸ Download original image` hoặc `▸ Save to collection ▸ [folder]` | Hoạt động cả trên trang lưới có lớp link phủ lên ảnh |
| **Dashboard** | Nút tải trên từng card | Tải lại ảnh đã lưu bất cứ lúc nào |

### 3.3 Công tắc bật/tắt icon hover
Switch **Hover icons** ở header dashboard. Tắt là icon biến mất khỏi **mọi tab đang mở
ngay lập tức, không cần reload**. Extension vẫn chạy đầy đủ — menu chuột phải và
dashboard không bị ảnh hưởng.

> Góc kể chuyện tốt cho blog: người dùng thường bỏ cài extension loại này vì icon
> vướng mắt khi đang làm việc khác. Ở đây tắt icon **không** đồng nghĩa mất tính năng.

### 3.4 Thư mục & bộ sưu tập
- Tạo thư mục tuỳ ý (*T-Shirt Ideas, Wallpapers, Client Work…*)
- Lưu ảnh vào thư mục ngay từ trang web, không cần mở dashboard
- **Tự phát hiện trùng**: cùng một ảnh lưu lại vào cùng thư mục sẽ báo "Already in collection"
- Sidebar hiện số lượng ảnh mỗi thư mục

### 3.5 Truy nguồn ảnh
Mỗi ảnh lưu lại đều ghi kèm trang nguồn:
- **Badge domain** bấm được ở góc dưới-trái mỗi card → mở lại đúng trang gốc
- **Tìm theo domain** trong ô search (gõ `etsy.com` để lọc)
- **`sources.csv`** trong mỗi file ZIP: `filename, title, folder, source_domain,
  source_url, saved_at` — CRLF + BOM UTF-8 để Excel mở đúng ký tự có dấu

> Dữ liệu nguồn đã được ghi từ **v1.0.0**, nên người dùng cũ thấy nguồn ngay sau khi
> cập nhật lên 1.1.0 mà không mất gì.

### 3.6 Tải hàng loạt thành ZIP
- **Download All (.zip)** hoặc **Download Selected .zip**
- Trong file ZIP, ảnh được **gom theo đúng thư mục** của bộ sưu tập
- Tự nhận đuôi file thật bằng magic bytes nếu URL không có đuôi
- Tên file trùng được tự động đánh số
- Kèm `sources.csv`
- Tên file xuất: `image-collection-<timestamp>.zip`

### 3.7 Tìm kiếm & quản lý
Ô search khớp đồng thời **tên ảnh, domain nguồn, và tên thư mục**.
Có Select All, xoá nhiều ảnh, xoá từng ảnh.

### 3.8 Chi tiết hoàn thiện đáng nhắc tới
Những điểm này thường bị extension khác làm ẩu — nên đưa vào bài so sánh:

- **Icon không bao giờ bị méo.** Toàn bộ giao diện chèn vào trang nằm trong Shadow DOM
  riêng, CSS của website không chạm tới được. Nút luôn tròn, đúng kích thước trên mọi site.
- **Không hiện icon trên video.** Trình phát video (YouTube…) bị bỏ qua, kể cả khi
  poster của video là ảnh nền CSS.
- **Bắt được ảnh nằm dưới lớp phủ.** Trang dạng lưới sản phẩm hay phủ một thẻ `<a>`
  trong suốt lên ảnh; extension dò xuyên qua để tìm đúng ảnh dưới con trỏ.
- **Nơi lưu gọn gàng.** Ảnh tải về vào `ImageCollector/`, có thư mục thì vào
  `ImageCollector/<Tên thư mục>/`.

---

## 4. Hướng dẫn sử dụng (bản đầy đủ, dùng lại cho blog "how to")

### Cài đặt
1. Cài từ store của trình duyệt
2. Ghim icon extension lên thanh công cụ để mở dashboard nhanh

### Lưu ảnh khi đang lướt web
1. Rê chuột lên ảnh bất kỳ → hai icon hiện ở góc trên-phải
2. Bấm 🔖 **Save** → chọn thư mục từ dropdown
3. Toast xác nhận hiện lên

*Hoặc:* chuột phải lên ảnh → **Image Collector ▸ Save to collection ▸** chọn thư mục.

### Tải nhanh một ảnh
Rê chuột lên ảnh → bấm ⬇ **Download**.
*Hoặc:* chuột phải → **Image Collector ▸ Download original image**.

Ảnh về máy là **bản gốc**, không phải thumbnail đang thấy.

### Tắt icon hover khi không cần
Mở dashboard → gạt switch **Hover icons** ở header. Icon biến mất ngay trên mọi tab.
Chuột phải vẫn dùng được bình thường.

### Quản lý bộ sưu tập & tải hàng loạt
1. Bấm icon extension để mở dashboard
2. Dùng sidebar chuyển giữa **All Images** và các thư mục
3. **New Folder** để tạo thư mục mới
4. Chọn từng ảnh hoặc **Select All**
5. **Download All (.zip)** hoặc **Download Selected .zip**
6. Giải nén: ảnh đã gom theo thư mục, kèm `sources.csv`

### Truy lại nguồn ảnh
- Bấm badge domain ở góc dưới-trái card → mở lại trang gốc
- Gõ domain vào ô search để lọc
- Mở `sources.csv` trong file ZIP bằng Excel / Google Sheets

---

## 5. Câu hỏi thường gặp (FAQ — dùng cho blog & store)

**Ảnh tải về có đúng là ảnh gốc không?**
Có. Extension đọc thuộc tính DOM của trang để tìm bản gốc, thay vì dùng URL đang hiển thị.
Với Amazon và Etsy có quy tắc riêng cho từng site.

**Có gửi dữ liệu của tôi đi đâu không?**
Không. Toàn bộ bộ sưu tập và thư mục nằm trong `chrome.storage.local` trên máy bạn.
Không có tài khoản, không đăng nhập, không máy chủ, không theo dõi.

**Tắt icon hover thì có mất tính năng không?**
Không. Chuột phải và dashboard vẫn hoạt động đầy đủ.

**Ảnh lưu trước khi cập nhật có hiện nguồn không?**
Có. Thông tin nguồn đã được ghi từ phiên bản đầu tiên.

**Lưu ảnh có chiếm dung lượng ổ đĩa không?**
Không. Lưu vào bộ sưu tập chỉ ghi lại đường dẫn và thông tin ảnh. Chỉ khi bấm tải
thì file mới về máy.

**Dùng được trên trình duyệt nào?**
Chrome, Microsoft Edge, Opera, Brave và Firefox.

**Vì sao cần quyền truy cập mọi trang web?**
Để phát hiện ảnh khi rê chuột và đọc thuộc tính ảnh độ phân giải cao trên bất kỳ site nào.
Extension không đọc, không lưu, không gửi đi nội dung trang.

---

## 6. Đoạn copy sẵn để dán

> ⚠️ Giới hạn ký tự mỗi store có thể đổi — **đếm lại trước khi nộp**.
> Số ký tự ghi kèm dưới đây đã tính sẵn.

### Tagline (chọn 1)
```
Download the original, not the thumbnail.
```
```
Collect images. Keep the source. Export everything.
```
```
Hover, save, batch-download — in original quality.
```

### Mô tả ngắn — dùng cho `description` trong manifest & summary của store
**Giới hạn manifest Chrome/Edge: 132 ký tự.**

Bản đang dùng (130 ký tự):
```
Powered by Tshirts I Want: Quick download & bookmark images into custom folders, then batch download graphic designs with 1-click.
```

Phương án thay, nhấn vào điểm khác biệt (124 ký tự):
```
Hover or right-click any image to download the true original, save into folders, and batch-export a whole collection as ZIP.
```

Phương án ngắn gọn (98 ký tự):
```
Download original images, not thumbnails. Save into folders and batch-export them as a single ZIP.
```

### Mô tả vừa — cho AMO summary (giới hạn 250 ký tự) · 244 ký tự
```
Image Collector saves and downloads the original image behind any thumbnail. Hover or right-click to grab it, organise images into custom folders as you browse, then export a whole collection as one ZIP — with a CSV of every image's source URL.
```

### Mô tả dài — cho trang listing của store
```
Image Downloader & Collector turns image hunting into a clean workflow.

WHY IT'S DIFFERENT
Most image downloaders grab whatever URL the page is displaying — which is usually a compressed thumbnail. Image Collector resolves the real original from the page itself, with dedicated rules for Amazon and Etsy, so what lands on your drive is the full-quality file.

HOVER OR RIGHT-CLICK
Hover any image to reveal a small Download and Save button in the corner. Prefer a cleaner page? Turn the hover icons off with one switch and use the right-click menu instead — Image Collector > Download original image, or Save to collection and pick a folder. Nothing is lost either way.

ORGANISE AS YOU BROWSE
Create folders like "T-Shirt Ideas", "Client Work" or "Wallpapers" and file images into them straight from the page. Saving a bookmark costs no disk space — files are only downloaded when you ask for them. Duplicates are detected automatically.

NEVER LOSE THE SOURCE
Every saved image remembers the page it came from. Each card shows a clickable domain badge that reopens the original page, you can search your collection by domain, and every ZIP export includes a sources.csv listing the filename, title, folder, domain, source URL and save date. Your reference library stays traceable months later.

BATCH EXPORT
Select some images or take the whole collection and download it as a single ZIP. Images are grouped into folders inside the archive exactly as you organised them.

BUILT WITH CARE
The on-page buttons live in an isolated shadow root, so no website's CSS can distort them. Video players are skipped. Images sitting underneath transparent link overlays — common on product grids — are still detected.

PRIVACY FIRST
No account, no sign-in, no servers, no tracking. Everything stays in your browser's local storage.

Powered by Tshirts I Want — https://tshirtsiwant.com/
```

### Danh sách tính năng dạng bullet — cho landing page / social
```
• Downloads the true original image, not the on-screen thumbnail
• Dedicated support for Amazon and Etsy product images
• Hover buttons or right-click menu — your choice
• One switch to hide the hover icons without losing any feature
• Organise into custom folders while you browse
• Every image remembers its source page
• Batch-export a collection as a single ZIP, folders preserved
• sources.csv included in every export
• Search by image name, folder, or source domain
• 100% local — no account, no tracking
```

### Mô tả tiếng Việt — cho blog VN
```
Image Collector giúp bạn tải đúng ảnh gốc phía sau mỗi thumbnail. Rê chuột hoặc bấm chuột phải lên bất kỳ ảnh nào để tải về hoặc lưu vào thư mục riêng, rồi xuất cả bộ sưu tập thành một file ZIP kèm danh sách nguồn của từng ảnh. Có quy tắc riêng cho Amazon và Etsy. Toàn bộ dữ liệu nằm trên máy bạn, không tài khoản, không theo dõi.
```

### Từ khoá / tag
```
image downloader, bulk image download, batch download images, save images,
original image, full resolution, high resolution images, image collector,
etsy image downloader, amazon image downloader, design inspiration,
mood board, print on demand, graphic assets, zip download, image organizer
```

---

## 7. Góc viết blog gợi ý

1. **"Tại sao extension tải ảnh của bạn chỉ tải về thumbnail"** — bài giải thích kỹ thuật:
   `srcset`, tham số kích thước CDN, thuộc tính DOM của Amazon/Etsy. Đây là bài có giá
   trị SEO cao nhất vì giải quyết đúng nỗi đau người dùng chưa gọi tên được.
2. **"Nghiên cứu đối thủ trên Etsy mà không lạc mất nguồn"** — bài workflow cho seller POD,
   nhấn vào `sources.csv`.
3. **"Dựng mood board 200 ảnh trong 10 phút"** — bài use case, nhấn batch ZIP + thư mục.
4. **"Extension nên biết cách tự biến mất"** — bài quan điểm về thiết kế, lấy công tắc
   hover làm ví dụ.

---

## 8. Ranh giới — điều **không** được viết

Để tránh bị store gỡ hoặc mất uy tín, tuyệt đối không tuyên bố:

- ❌ **"Tải được ảnh từ mọi website"** — site dùng URL ký số hoặc chặn hotlink có thể thất bại.
- ❌ **"Vượt qua chặn tải ảnh / DRM"** — extension không làm việc đó và store cấm.
- ❌ **"Tải được ảnh Instagram / Facebook / Pinterest riêng tư"** — chưa kiểm chứng, dễ vi phạm chính sách.
- ❌ **"Nâng cấp / làm nét ảnh"** — extension lấy file gốc có sẵn, **không** upscale.
- ❌ **"Tải hàng loạt toàn bộ ảnh trong trang chỉ bằng 1 click"** — hiện phải lưu từng ảnh trước, chưa có chức năng quét cả trang.
- ❌ Nhắc tới tính năng chưa có: tag thủ công, đồng bộ đám mây, chia sẻ bộ sưu tập, tải video.

Câu an toàn thay thế: *"works across the web, with dedicated support for Amazon and Etsy"*.

---

## 9. Ghi chú bản quyền cần có trong bài dài

> Người dùng chịu trách nhiệm tôn trọng bản quyền và điều khoản sử dụng của website.
> Công cụ này dành cho việc thu thập tài liệu tham khảo và nghiên cứu hợp pháp.

---

## 10. Thông tin cố định

| Trường | Giá trị |
|---|---|
| Tên extension | Image Downloader & Collector - Batch Save |
| Tên rút gọn | Image Collector |
| Version hiện tại | 1.1.0 |
| Nhà phát hành | Tshirts I Want |
| Website | https://tshirtsiwant.com/ |
| Quyền sử dụng | `storage`, `downloads`, `contextMenus`, `<all_urls>` |
| Thu thập dữ liệu | Không |
| Giá | Miễn phí |
