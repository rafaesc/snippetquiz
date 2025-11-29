import {
    MessageYoutubeTranscriptRequest,
    MessageYoutubeTranscriptResponse,
    YoutubeData
} from "../types";
import { GET_YOUTUBE_TRANSCRIPT, CONNECT_TO_STREAM_NOTIFICATION } from "../constants";

interface YouTubeTranscriptRequest {
    videoId: string;
    withTimestamp?: boolean;
    tryFallback?: boolean;
}

const generateYoutubeRequest = (request: YouTubeTranscriptRequest): MessageYoutubeTranscriptRequest => ({
    action: GET_YOUTUBE_TRANSCRIPT,
    videoId: request.videoId,
    withTimestamp: request.withTimestamp,
    tryFallback: request.tryFallback
})

export async function getYouTubeTranscriptFromTab(
    tabId: number,
    request: YouTubeTranscriptRequest
): Promise<YoutubeData> {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(
            tabId,
            generateYoutubeRequest(request),
            (response: MessageYoutubeTranscriptResponse) => {
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

export async function connectToStreamNotification() {
    chrome.runtime.sendMessage({ action: CONNECT_TO_STREAM_NOTIFICATION })
}
