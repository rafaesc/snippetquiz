const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CONTEXT_SAVE_SELECTED_TEXT = "saveSelectedText";
const CONNECT_TO_STREAM_NOTIFICATION = "connectToStreamNotification";

let notificationTimeoutSingleton: number;
const NOTIFICATION_CONNECTION_TIMEOUT = 30000;
const reloadTimeoutSingleton = () => setTimeout(() => {
  if (eventSource) {
    disconnectStream()
  }
}, NOTIFICATION_CONNECTION_TIMEOUT);

// Token management functions
const getAccessToken = async (): Promise<string | null> => {
  const result = await chrome.storage.local.get('accessToken');
  return result.accessToken || null;
};

const getRefreshToken = async (): Promise<string | null> => {
  const result = await chrome.storage.local.get('refreshToken');
  return result.refreshToken || null;
};

const setTokens = async (accessToken: string, refreshToken: string) => {
  await chrome.storage.local.set({
    accessToken,
    refreshToken
  });
};

const clearTokens = async () => {
  await chrome.storage.local.remove(['accessToken', 'refreshToken']);
};

const refreshAccessToken = async () => {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_BASE_URL}/api/auth-service/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    await clearTokens();
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  await setTokens(data.tokens.accessToken, data.tokens.refreshToken);
  return data;
};

const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  let accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error('No access token available');
  }

  const defaultOptions: RequestInit = {
    ...options,
    credentials: 'omit',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers,
    },
  };

  let response = await fetch(`${API_BASE_URL}${url}`, defaultOptions);

  // If token expired, try to refresh
  if (response.status === 401) {
    try {
      await refreshAccessToken();
      accessToken = await getAccessToken();

      // Retry with new token
      defaultOptions.headers = {
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers,
      };
      response = await fetch(`${API_BASE_URL}${url}`, defaultOptions);
    } catch (error) {
      await clearTokens();
      throw new Error('Authentication failed');
    }
  }

  return response;
};

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === CONTEXT_SAVE_SELECTED_TEXT && info.selectionText) {
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
      connectToStream()
    } catch (error) {
      console.error('Failed to create content entry:', error);
    }
  }
});

type StreamNotificationResponse = {
  text: string,
  to: number,
  seconds: number,
  spriteURL: string
}


chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  if (request.action === CONNECT_TO_STREAM_NOTIFICATION) {
    connectToStream()
    return true;
  }
  return false;
});

let eventSource: EventSource | null = null;

const connectToStream = async () => {
  if (eventSource && notificationTimeoutSingleton) {
    clearTimeout(notificationTimeoutSingleton);
    notificationTimeoutSingleton = reloadTimeoutSingleton();
    return;
  }

  notificationTimeoutSingleton = reloadTimeoutSingleton();
  let token: string | null = null;
  try {
    token = await getAccessToken();
  } catch (error) {
    console.error('Error getting access token:', error);
    return;
  }

  if (!token) {
    console.warn('No access token found, cannot connect to stream');
    return;
  }

  eventSource = new EventSource(`${API_BASE_URL}/api/stream/notification?token=${encodeURIComponent(token)}`);

  eventSource.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data) as StreamNotificationResponse;
      console.log("Snippetquiz notification.", data)
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        console.log("Snippetquiz TAB.", tab)
        if (tab?.id) {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            args: [data],
            func: (data) => {
              console.debug("Snippetquiz init.", data)
              const spriteURL = data.spriteURL;

              const img = new Image();
              img.src = spriteURL;
              let container: HTMLDivElement | null = null;

              img.onload = () => {
                console.log("Snippetquiz img onload.")

                const containerId = "snippetquiz-animated-character-wrapper";
                const existing = document.getElementById(containerId);
                if (existing) existing.remove();

                const style = document.createElement("style");
                style.textContent = `
    .char-container {
      position: fixed;
      top: 20px;
      right: 20px;
      display: flex;
      align-items: center;
      gap: 5px;
      z-index: 9999;
      font-family: 'Arial', sans-serif;
    }

    .sprite {
      width: 92px;
      height: 110px;
      background-image: url('${spriteURL}');
      background-repeat: no-repeat;
      background-position: 0 0;
      animation: play ${data.seconds}s steps(150) infinite, bounce 0.4s ease-in-out;
      cursor: pointer;
    }

    .speech-bubble {
      background: #fff;
      color: #000;
      padding: 8px 12px;
      border: 2px solid #000;
      border-radius: 12px;
    max-width: 400px;
      font-size: 14px;
      font-weight: bold;
      position: relative;
      box-shadow: 3px 3px 0px rgba(0,0,0,0.2);
      margin-right: 5px;
      animation: bounce 0.4s ease-in-out;
    }

    .speech-bubble::after {
      content: '';
      position: absolute;
      right: -10px;
      top: 50%;
      transform: translateY(-50%);
      border-width: 8px 0 8px 10px;
      border-style: solid;
      border-color: transparent transparent transparent #000;
    }
    
    .speech-bubble::before {
      content: '';
      position: absolute;
      right: -7px; 
      top: 50%;
      transform: translateY(-50%);
      border-width: 6px 0 6px 8px;
      border-style: solid;
      border-color: transparent transparent transparent #fff;
      z-index: 1;
    }

    .close-wrapper {
        position: absolute;
        top: -10px;
        left: -17px;
        width: 34px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10;
        transition: transform 0.2s;
    }

    .close-wrapper:hover {
        transform: scale(1.1);
    }

    .timer-svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
    }

    .timer-circle {
        fill: none;
        stroke: #ff5f5f;
        stroke-width: 3;
        stroke-linecap: round;
        stroke-dasharray: 94; 
        stroke-dashoffset: 0;
        animation: countdown 15s linear forwards;
    }

    .btn-bg {
        position: absolute;
        width: 26px;
        height: 26px;
        background: #f94f4f;
        border-radius: 50%;
        z-index: -1;
        box-shadow: 0 0 5px rgba(0,0,0,0.3);
    }

    .close-text {
        color: white;
        font-weight: bold;
        font-size: 14px;
        line-height: 1;
    }
    @keyframes countdown {
        from { stroke-dashoffset: 0; }
        to   { stroke-dashoffset: 94; }
    }

    @keyframes play {
      from { background-position: 0 0; }
      to   { background-position: ${data.to}px 0; }
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `;
                document.head.appendChild(style);

                container = document.createElement("div");
                container.className = "char-container";
                container.id = containerId;

                const bubble = document.createElement("div");
                bubble.className = "speech-bubble";
                bubble.innerText = data.text

                const sprite = document.createElement("div");
                sprite.className = "sprite";

                const closeWrapper = document.createElement("div");
                closeWrapper.className = "close-wrapper";

                const svgNS = "http://www.w3.org/2000/svg";
                const svg = document.createElementNS(svgNS, "svg");
                svg.classList.add("timer-svg");
                svg.setAttribute("viewBox", "0 0 34 34");

                const circle = document.createElementNS(svgNS, "circle");
                circle.classList.add("timer-circle");
                circle.setAttribute("cx", "17");
                circle.setAttribute("cy", "17");
                circle.setAttribute("r", "15");

                svg.appendChild(circle);

                const btnBg = document.createElement("div");
                btnBg.className = "btn-bg";

                const closeText = document.createElement("span");
                closeText.className = "close-text";
                closeText.innerText = "X";

                closeWrapper.appendChild(btnBg);
                closeWrapper.appendChild(svg);
                closeWrapper.appendChild(closeText);

                const closeChar = () => {
                  if (container && container.parentNode) {
                    container.style.opacity = '0';
                    container.style.transition = 'opacity 0.3s ease';
                    setTimeout(() => {
                      if (container && container.parentNode) {
                        container.parentNode.removeChild(container);
                      }
                    }, 300);
                  }
                };

                closeWrapper.onclick = closeChar;

                container.appendChild(bubble);
                container.appendChild(sprite);
                container.appendChild(closeWrapper);

                document.body.appendChild(container);

                void container.offsetWidth;

                container.style.opacity = "1";
                container.style.transform = "translateY(0)";

                setTimeout(closeChar, 15000);
              };

              img.onerror = (e) => {
                console.error("Error snippetquiz sprite.", e)
                if (container && container.parentNode) {
                  container.parentNode.removeChild(container);
                }
              };
              console.log("Snippetquiz sprite loaded.")

            }
          });
        }
      } catch (scriptError) {
        console.log('Could not show visual feedback:', scriptError);
      }
    } catch (error) {
      console.error('Error parsing stream data:', error);
    }
  };

  eventSource.onerror = (error) => {
    console.error('Stream connection error:', error);
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
};

// Disconnect from stream
const disconnectStream = () => {
  if (eventSource) {
    clearTimeout(notificationTimeoutSingleton);
    eventSource.close();
    eventSource = null;
  }
};

// Listen for storage changes to handle login/logout
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.accessToken) {
    if (!changes.accessToken.newValue) {
      // User logged out, disconnect from stream
      disconnectStream();
    }
  }
});