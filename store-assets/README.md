# Image Downloader & Collector - Store Reviewer Notes

**Extension Title:** Image Downloader & Collector - Batch Save Graphic Designs  
**Publisher:** Tshirts I Want  
**Official Website:** [https://tshirtsiwant.com/](https://tshirtsiwant.com/)  
**Manifest Version:** Manifest V3  
**Current Version:** 1.1.0  

---
## 📖 Tính năng & hướng dẫn sử dụng

Mô tả sản phẩm, danh sách tính năng đầy đủ, hướng dẫn từng bước, FAQ và các đoạn copy
sẵn cho store/blog đều nằm ở **[`../PRODUCT.md`](../PRODUCT.md)** — nguồn duy nhất.

File này chỉ giữ phần dành riêng cho **reviewer của store**: giải trình quyền và chính
sách riêng tư. Làm vậy để mô tả tính năng không tồn tại hai bản rồi lệch nhau.

---

## 🛡️ Permissions Justification (For Store Reviewers)

| Permission | Purpose & Justification |
| :--- | :--- |
| `storage` | Required to save user folder structures and image bookmark metadata locally using `chrome.storage.local`. |
| `downloads` | Required to initiate single image downloads and trigger ZIP archive batch downloads via `chrome.downloads`. |
| `contextMenus` | Required to add the **Image Collector** entry to the browser right-click menu, giving users a second way to download an image or save it to a folder. The menu is only added for `image` and `link` contexts. No page content is read by this permission. |
| `<all_urls>` (host permission) | Required to detect mouse hover events on images across arbitrary third-party websites and extract high-resolution `srcset` / `data-src` image URLs. |

**Note on `contextMenus` (added in 1.1.0):** the extension deliberately does not simply download the
URL the browser reports for a right-clicked image, because on sites such as Amazon and Etsy that URL
is the on-screen thumbnail. The content script instead resolves the original image from the page's
own DOM attributes, which is why the feature relies on the existing `<all_urls>` host permission
rather than requesting anything additional.

---

## 🔒 Privacy Policy Summary

- **No Data Collection**: We do not collect, transmit, track, or sell user personal data, browsing history, or saved images.
- **Local Storage**: All image collections and custom folder metadata reside 100% locally within your browser (`chrome.storage.local`).
- **Source Tracking Is Local**: The source page URL stored with each saved image is written to local
  storage only, is shown solely to the user in their own dashboard and ZIP export, and is never
  transmitted anywhere.
- **Official Publisher**: Developed and maintained by Tshirts I Want ([https://tshirtsiwant.com/](https://tshirtsiwant.com/)).

---

## 📬 Support & Contact

- **Website:** [https://tshirtsiwant.com/](https://tshirtsiwant.com/)
- **Documentation:** Included with Chrome & Microsoft Edge Store Distribution Package
