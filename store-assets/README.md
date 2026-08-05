# Image Downloader & Collector - User Guide & Documentation

**Extension Title:** Image Downloader & Collector - Batch Save Graphic Designs  
**Publisher:** Tshirts I Want  
**Official Website:** [https://tshirtsiwant.com/](https://tshirtsiwant.com/)  
**Manifest Version:** Manifest V3  

---

## 🌟 Overview

**Image Downloader & Collector** is a high-speed browser extension created for graphic designers, digital artists, creators, and shoppers to easily discover, bookmark, organize, and batch download visual art, design mockups, and high-resolution images across the web.

Powered by [Tshirts I Want](https://tshirtsiwant.com/), this extension simplifies the design inspiration workflow by offering intuitive hover-to-save overlays, custom folder collections, and single-click ZIP batch downloads.

---

## ⚡ Key Features

1. **Mouse Hover Quick Action Bar**: Hover over any image on any webpage to reveal instant quick actions:
   - ⚡ **Quick Download**: Download the high-resolution original image immediately.
   - 🔖 **Save to Collection**: Bookmark the image into custom folders without cluttering your hard drive.
2. **Original High-Res Extraction**: Smart algorithm detecting highest resolution source from `srcset`, `data-src`, `data-original`, and un-scaled CDN parameters.
3. **Custom Folder & Asset Management**: Create personalized collection folders (*e.g., T-Shirt Ideas, Wallpapers, Graphic Artwork*).
4. **1-Click ZIP Batch Downloader**: Clean dashboard interface to select and download all pinned images in a folder as a single ZIP archive.
5. **Privacy-First & Lightweight**: Operates entirely in the browser with 0% data tracking and zero background CPU bloat.

---

## 📖 Step-by-Step User Guide

### 1. Saving Images While Browsing
- Visit any website containing images (*e.g., Unsplash, Pinterest, Behance, online stores*).
- Hover your mouse cursor over any image or design.
- Click the **Save** button on the floating bar.
- Choose your desired folder from the dropdown menu (*or save to Default*).
- A success toast alert will confirm the image has been bookmarked.

### 2. Quick Single Image Download
- Hover over any image and click **Download** to save the original file directly to your computer's download folder.

### 3. Managing Collections & Batch Downloading
- Click the **Image Downloader & Collector** icon in your browser toolbar to open the Popup Dashboard.
- Use the left sidebar to navigate between **All Images**, **Default**, or custom folders.
- Click **"New Folder"** to create custom categories.
- Select specific images or click **"Select All"**.
- Click **"Download All (.zip)"** or **"Download Selected .zip"** to generate and download a single ZIP file containing all chosen images.

---

## 🛡️ Permissions Justification (For Store Reviewers)

| Permission | Purpose & Justification |
| :--- | :--- |
| `storage` | Required to save user folder structures and image bookmark metadata locally using `chrome.storage.local`. |
| `downloads` | Required to initiate single image downloads and trigger ZIP archive batch downloads via `chrome.downloads`. |
| `<all_urls>` (host permission) | Required to detect mouse hover events on images across arbitrary third-party websites and extract high-resolution `srcset` / `data-src` image URLs. |

---

## 🔒 Privacy Policy Summary

- **No Data Collection**: We do not collect, transmit, track, or sell user personal data, browsing history, or saved images.
- **Local Storage**: All image collections and custom folder metadata reside 100% locally within your browser (`chrome.storage.local`).
- **Official Publisher**: Developed and maintained by Tshirts I Want ([https://tshirtsiwant.com/](https://tshirtsiwant.com/)).

---

## 📬 Support & Contact

- **Website:** [https://tshirtsiwant.com/](https://tshirtsiwant.com/)
- **Documentation:** Included with Chrome & Microsoft Edge Store Distribution Package
