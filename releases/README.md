# Release archive

Zip đã ship (hoặc đã nộp) cho từng store, giữ lại để trace back và đối chiếu khi
store hỏi về một version cụ thể. **Không build lại đè lên đây** — `build.ps1` ghi
vào `dist\`, chỉ copy sang đây khi một version thực sự được nộp.

Mỗi version đều có tag git tương ứng (`git show v1.0.1`), nên source luôn tái dựng
được kể cả khi file zip thất lạc:

```bash
git checkout v1.0.1 && ./build.ps1
```

## Nguồn gốc từng file

| File | Nguồn gốc |
|---|---|
| `v1.0.1/ImageCollector-chromium-v1.0.1.zip` | ✅ **Bản gốc** đã build và nộp lên Edge/Opera |
| `v1.0.1/ImageCollector-firefox-v1.0.1.zip` | ✅ **Bản gốc** đã build (chưa nộp AMO) |
| `v1.0.0/ImageCollector-firefox-v1.0.0.zip` | ♻️ **Tái dựng** — xem ghi chú bên dưới |

### Ghi chú về `firefox-v1.0.0.zip`

Đây là version **đang live trên Firefox AMO**. File zip gốc đã bị xoá nhầm trong
lúc dọn `dist\` ngày 2026-08-05, nên bản trong này được **tái dựng** bằng:

```powershell
.\build.ps1 -Target firefox -Version 1.0.0
```

Đã kiểm chứng trước khi tái dựng: toàn bộ 10 file source trong `src\` **giống hệt
từng byte** với tag `v1.0.0`, và manifest tại tag đó đúng là bản Gecko ở version
1.0.0. Nội dung vì vậy tương đương bản đã nộp; chỉ **byte của chính file zip**
(thứ tự entry, timestamp, mức nén) là có thể khác. Đủ dùng để đối chiếu nội dung,
**không** dùng làm bằng chứng checksum.

## Lịch sử

| Version | Chrome | Edge | Firefox | Opera |
|---|---|---|---|---|
| 1.0.0 | — | — | ✅ live | ❌ trượt (nộp nhầm bản Gecko lên store Chromium) |
| 1.0.1 | chưa nộp | ✅ approved | chưa nộp | ⏳ chờ duyệt |
