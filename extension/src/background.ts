chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "saveSelectedText",
      title: "Save text selected",
      contexts: ["selection"]
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === "saveSelectedText" && info.selectionText) {
      const text = info.selectionText.trim();
      chrome.storage.local.get("savedTexts", (data) => {
        const current = data.savedTexts || [];
        current.push({ text, timestamp: Date.now() });
        chrome.storage.local.set({ savedTexts: current });
      });
    }
  });
  