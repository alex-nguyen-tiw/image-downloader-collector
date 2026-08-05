// Background Service Worker for Image Collector & Batch Downloader

// Initialize default storage on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['folders', 'savedImages'], (result) => {
    if (!result.folders) {
      chrome.storage.local.set({
        folders: [
          { id: 'default', name: 'Default', isDefault: true, createdAt: Date.now() }
        ]
      });
    }
    if (!result.savedImages) {
      chrome.storage.local.set({ savedImages: [] });
    }
  });
});

// --- Context menus ----------------------------------------------------------
// One top-level parent keeps the menu to a single line. Creating two top-level
// items instead would make Chrome auto-group them under the full extension
// name ("Image Downloader & Collector - Batch Save"), which is far too long.
// Chrome draws the extension icon next to the parent automatically.
const MENU_ROOT = 'ic-root';
const MENU_DOWNLOAD = 'ic-download';
const MENU_SAVE = 'ic-save';
const MENU_SAVE_PREFIX = 'ic-save-folder:';

// 'link' is included because grid/home pages often lay a transparent <a> over
// the image, which makes Chrome report a link context rather than an image one.
const MENU_CONTEXTS = ['image', 'link'];

function buildMenus(folders) {
  // The service worker can restart at any time, so always start from a clean
  // slate rather than risking duplicate-id errors.
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ROOT,
      title: 'Image Collector',
      contexts: MENU_CONTEXTS
    });

    chrome.contextMenus.create({
      id: MENU_DOWNLOAD,
      parentId: MENU_ROOT,
      title: 'Download original image',
      contexts: MENU_CONTEXTS
    });

    chrome.contextMenus.create({
      id: MENU_SAVE,
      parentId: MENU_ROOT,
      title: 'Save to collection',
      contexts: MENU_CONTEXTS
    });

    const list = (folders && folders.length)
      ? folders
      : [{ id: 'default', name: 'Default' }];

    list.forEach((folder) => {
      chrome.contextMenus.create({
        id: MENU_SAVE_PREFIX + folder.id,
        parentId: MENU_SAVE,
        title: folder.name,
        contexts: MENU_CONTEXTS
      });
    });
  });
}

function refreshMenus() {
  chrome.storage.local.get(['folders'], (res) => buildMenus(res.folders));
}

chrome.runtime.onInstalled.addListener(refreshMenus);
// MV3 workers are torn down when idle; menus must be re-registered on startup.
chrome.runtime.onStartup.addListener(refreshMenus);

// Keep the folder submenu in step with the collection.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.folders) {
    buildMenus(changes.folders.newValue);
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || tab.id === undefined) return;

  let message = null;
  if (info.menuItemId === MENU_DOWNLOAD) {
    message = { action: 'CTX_DOWNLOAD' };
  } else if (String(info.menuItemId).startsWith(MENU_SAVE_PREFIX)) {
    const folderId = String(info.menuItemId).slice(MENU_SAVE_PREFIX.length);
    message = { action: 'CTX_SAVE', folderId: folderId };
  }
  if (!message) return;

  if (message.action === 'CTX_SAVE') {
    chrome.storage.local.get(['folders'], (res) => {
      const folder = (res.folders || []).find(f => f.id === message.folderId);
      message.folderName = folder ? folder.name : 'Default';
      sendToTab(tab.id, message, info);
    });
  } else {
    sendToTab(tab.id, message, info);
  }
});

// The content script owns the site-specific logic that turns a thumbnail into
// the original. If it isn't there (tab opened before install, PDF viewer,
// restricted page), fall back to the displayed URL so the click still does
// something — accepting that it may be a thumbnail.
function sendToTab(tabId, message, info) {
  chrome.tabs.sendMessage(tabId, message, () => {
    if (!chrome.runtime.lastError) return;
    if (!info.srcUrl) return;

    if (message.action === 'CTX_DOWNLOAD') {
      chrome.downloads.download({
        url: info.srcUrl,
        filename: `ImageCollector/${generateFilename(info.srcUrl, '')}`,
        saveAs: false
      });
    } else if (message.action === 'CTX_SAVE') {
      // Stores the displayed URL, which may be a thumbnail. The popup re-applies
      // the Amazon/Etsy upgrade when downloading, so the saved entry still
      // yields the original for those sites.
      saveFallback(info, message);
    }
  });
}

function saveFallback(info, message) {
  chrome.storage.local.get(['savedImages'], (res) => {
    const savedImages = res.savedImages || [];
    const folderId = message.folderId || 'default';
    if (savedImages.some(img => img.url === info.srcUrl && img.folderId === folderId)) return;

    let domain = '';
    try { domain = new URL(info.pageUrl).hostname; } catch (e) {}

    savedImages.unshift({
      id: 'img_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      url: info.srcUrl,
      title: 'Saved Image',
      sourceUrl: info.pageUrl || '',
      sourceDomain: domain,
      folderId: folderId,
      folderName: message.folderName || 'Default',
      width: 0,
      height: 0,
      createdAt: Date.now()
    });
    chrome.storage.local.set({ savedImages });
  });
}

// Helper to extract clean filename from URL or title
function generateFilename(url, customName, index = null) {
  let ext = 'jpg';
  try {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const match = cleanUrl.match(/\.(jpg|jpeg|png|webp|gif|svg|avif|bmp)$/i);
    if (match) {
      ext = match[1].toLowerCase();
    }
  } catch (e) {}

  let baseName = 'image';
  if (customName && customName.trim() !== '') {
    baseName = customName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
  } else {
    baseName = `image_${Date.now()}`;
  }

  if (index !== null) {
    baseName += `_${index + 1}`;
  }

  return `${baseName}.${ext}`;
}

// Handle runtime messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'DOWNLOAD_SINGLE') {
    const { url, filename, folderName } = request;
    const cleanFilename = generateFilename(url, filename);
    const downloadPath = folderName && folderName !== 'Default' 
      ? `ImageCollector/${folderName}/${cleanFilename}` 
      : `ImageCollector/${cleanFilename}`;

    chrome.downloads.download({
      url: url,
      filename: downloadPath,
      saveAs: false
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('Download error:', chrome.runtime.lastError.message);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true, downloadId });
      }
    });
    return true; // Keep channel open for async response
  }
});
