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
      
      // Create the content entry using direct API call
      const response = await makeAuthenticatedRequest('/api/core/content-entry', {
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
    
      
    } catch (error) {
      console.error('Failed to create content entry:', error);
    }
  }
});

// Listen for messages from popup/content scripts
chrome.runtime.onMessage.addListener(() => {
  // Handle any background-specific logic here if needed
  return false; // Let other parts handle the message
});
  