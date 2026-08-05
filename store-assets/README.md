# Image Downloader & Collector - User Guide & Documentation

**Extension Title:** Image Downloader & Collector - Batch Save Graphic Designs  
**Publisher:** Tshirts I Want  
**Official Website:** [https://tshirtsiwant.com/](https://tshirtsiwant.com/)  
**Manifest Version:** Manifest V3  
**Current Version:** 1.1.0  

---

## 🌟 Overview

**Image Downloader & Collector** is a high-speed browser extension created for graphic designers, digital artists, creators, and shoppers to easily discover, bookmark, organize, and batch download visual art, design mockups, and high-resolution images across the web.

Powered by [Tshirts I Want](https://tshirtsiwant.com/), this extension simplifies the design inspiration workflow by offering intuitive hover-to-save overlays, custom folder collections, and single-click ZIP batch downloads.

---

## ⚡ Key Features

1. **Mouse Hover Quick Action Bar**: Hover over any image on any webpage to reveal instant quick actions:
   - ⚡ **Quick Download**: Download the high-resolution original image immediately.
   - 🔖 **Save to Collection**: Bookmark the image into custom folders without cluttering your hard drive.
2. **Right-Click Menu** *(new in 1.1.0)*: Right-click any image — original or thumbnail — and use
   **Image Collector ▸ Download original image** or **▸ Save to collection ▸ [folder]**.
   Works on grid and listing pages where a transparent link sits on top of the image.
3. **Hover Icons On/Off Switch** *(new in 1.1.0)*: A toggle in the dashboard header hides the on-page
   icons when you want a clean view. It takes effect instantly in every open tab, and the right-click
   menu keeps working while the icons are off — so you never lose access to the features.
4. **Original High-Res Extraction**: Smart algorithm detecting the highest resolution source from
   `srcset`, `data-src`, `data-original`, and un-scaled CDN parameters — plus dedicated rules for
   **Amazon** (`data-old-hires` / `data-a-dynamic-image`, size-modifier stripping) and
   **Etsy** (`il_fullxfull` upgrade), so you get the true original rather than the displayed thumbnail.
5. **Source Tracking** *(new in 1.1.0)*: Every saved image records the page it came from. The
   dashboard shows a clickable domain badge on each card that reopens the original page, the search
   box matches on domain, and every ZIP export ships a `sources.csv` listing filename, title, folder,
   domain, source URL and save date — so a collection stays traceable even after the files leave the
   extension.
6. **Custom Folder & Asset Management**: Create personalized collection folders (*e.g., T-Shirt Ideas, Wallpapers, Graphic Artwork*).
7. **1-Click ZIP Batch Downloader**: Clean dashboard interface to select and download all pinned images in a folder as a single ZIP archive.
8. **Privacy-First & Lightweight**: Operates entirely in the browser with 0% data tracking and zero background CPU bloat.

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

### 3. Using the Right-Click Menu
- Right-click any image on any page.
- Choose **Image Collector** from the context menu:
  - **Download original image** — same as the hover Download button; resolves and fetches the true
    original, not the thumbnail you see on screen.
  - **Save to collection ▸** — pick a folder from the submenu; the list stays in sync with the
    folders you create in the dashboard.
- Useful on product grids and listing pages where images sit under a clickable link.

### 4. Turning the Hover Icons Off
- Open the dashboard and use the **Hover icons** switch in the top-left of the header.
- Switching it off hides the Download/Save icons on all pages immediately — no reload required.
- The extension stays fully active: the right-click menu and the dashboard continue to work.

### 5. Tracing an Image Back to Its Source
- Each card in the dashboard shows the source domain in its bottom-left corner.
- Click that badge to reopen the exact page the image was saved from.
- Type a domain into the search box (*e.g. `etsy.com`*) to filter a collection by where images came from.
- Open `sources.csv` inside any exported ZIP to see the full source list in Excel or Google Sheets.

### 6. Managing Collections & Batch Downloading
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
