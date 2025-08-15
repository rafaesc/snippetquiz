interface YouTubeTranscriptRequest {
    videoId: string;
    withTimestamp?: boolean;
    tryFallback?: boolean;
}

interface YouTubeTranscriptResponse {
    success: boolean;
    data?: any;
    error?: string;
}

type Channel = {
    name?: string | null,
    id?: string | null,
    avatarUrl?: string | null
}

type FinalResult = {
    title: string;
    text: string;
    channel: Channel;
    durationMs?: number;
}

export async function getYouTubeTranscriptFromTab(
    tabId: number,
    request: YouTubeTranscriptRequest
): Promise<FinalResult> {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(
            tabId,
            {
                action: 'getYouTubeTranscript',
                ...request
            },
            (response: YouTubeTranscriptResponse) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }
                
                if (response?.success) {
                    resolve(response.data);
                } else {
                    reject(new Error(response?.error || 'Failed to get transcript'));
                }
            }
        );
    });
}

export async function isContentScriptReady(tabId: number): Promise<boolean> {
    return new Promise((resolve) => {
        chrome.tabs.sendMessage(
            tabId,
            { action: 'ping' },
            (_response) => {
                if (chrome.runtime.lastError) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            }
        );
    });
}