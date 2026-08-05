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
