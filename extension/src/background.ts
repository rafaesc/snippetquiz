const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Token management functions
const getAccessToken = async (): Promise<string | null> => {
  const result = await chrome.storage.local.get('accessToken');
  return result.accessToken || null;
};

const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const token = await getAccessToken();
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveSelectedText",
    title: "Add selected text to content bank",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "saveSelectedText" && info.selectionText) {
    const text = info.selectionText.trim();
    
    try {
      // Get the current tab information
      const sourceUrl = tab?.url || '';
      const pageTitle = tab?.title || '';
      
      // Get the default bank ID from storage
      const result = await chrome.storage.local.get('selectedBankId');
      const bankId = result.selectedBankId;
      
      if (!bankId) {
        console.warn('No default bank ID found. Please set a default bank in the extension popup.');
        // Still save to local storage as fallback
        chrome.storage.local.get("savedTexts", (data) => {
          const current = data.savedTexts || [];
          current.push({ 
            text, 
            timestamp: Date.now(),
            sourceUrl,
            pageTitle,
            status: 'pending_bank_selection'
          });
          chrome.storage.local.set({ savedTexts: current });
        });
        return;
      }
      
      // Create the content entry using direct API call
      const response = await makeAuthenticatedRequest('/api/content-entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: text,
          type: 'selected_text',
          sourceUrl: sourceUrl,
          pageTitle: pageTitle,
          bankId: bankId
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create content entry');
      }
      
      const contentEntry = await response.json();
      console.log('Content entry created successfully:', contentEntry);
      
      // Save to local storage with success status
      chrome.storage.local.get("savedTexts", (data) => {
        const current = data.savedTexts || [];
        current.push({ 
          text, 
          timestamp: Date.now(),
          entryId: contentEntry.id,
          sourceUrl,
          pageTitle,
          status: 'synced'
        });
        chrome.storage.local.set({ savedTexts: current });
      });
      
    } catch (error) {
      console.error('Failed to create content entry:', error);
      
      // Fallback: save to local storage if API call fails
      chrome.storage.local.get("savedTexts", (data) => {
        const current = data.savedTexts || [];
        current.push({ 
          text, 
          timestamp: Date.now(),
          sourceUrl: tab?.url || '',
          pageTitle: tab?.title || '',
          status: 'failed_to_sync',
          error: error instanceof Error ? error.message : 'Unknown error'

        });
        chrome.storage.local.set({ savedTexts: current });
      });
    }
  }
});

// Listen for messages from popup/content scripts
chrome.runtime.onMessage.addListener(() => {
  // Handle any background-specific logic here if needed
  return false; // Let other parts handle the message
});
  