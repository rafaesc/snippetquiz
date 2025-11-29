import {
    MessageYoutubeTranscriptRequest,
    MessageYoutubeTranscriptResponse,
    YoutubeChannel,
    YoutubeData,
    YoutubeLanguageOption,
    YoutubeTextData
} from "./lib/types";
import { GET_YOUTUBE_TRANSCRIPT } from "./lib/constants";

// Configuration constants
const MAX_RETRIES = 3;
const RETRY_DELAY = 500;

// Type definitions
interface TranscriptSegment {
    start: number;
    duration?: number;
    text: string;
    index?: number;
}

interface TranscriptResult {
    transcripts: TranscriptSegment[];
    transcriptParams: { lang: string; endpoint: string }[];
    durationMs?: number;
}

interface ProcessedTranscript {
    start: number;
    text: string;
}

type ShouldRetryFunction = (errorMsg: string, attempt: number) => boolean;
type OperationFunction<T> = () => Promise<T>;

// Retry function with exponential backoff
async function retryWithBackoff<T>(
    operation: OperationFunction<T>,
    maxRetries = MAX_RETRIES,
    delay = RETRY_DELAY,
    shouldRetry?: ShouldRetryFunction
): Promise<T> {
    let lastError: string | Error = "Unknown error occurred";
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await operation();
            if (isValidResult(result))
                return result;
            throw new Error(`Invalid result on attempt ${attempt}`);
        } catch (error) {
            const errorString = JSON.stringify(error);
            lastError = errorString;
            if (shouldRetry && !shouldRetry(errorString, attempt))
                throw error;
            if (attempt === maxRetries)
                throw lastError;
            const backoffDelay = delay * Math.pow(1.5, attempt - 1);
            await sleep(backoffDelay);
        }
    }
    throw lastError;
}

// Validate result function
function isValidResult(result: any): boolean {
    if (!result)
        return false;
    if (typeof result === "object" && "textData" in result) {
        const data = result as { textData?: any[] };
        const { textData: textArray = [] } = data ?? {};
        return textArray.length > 0;
    }
    return Array.isArray(result) ? result.length > 0 : typeof result === "string" ? result.trim().length > 0 : true;
}

// Sleep utility function
const sleep = (delay: number): Promise<void> => new Promise(resolve => setTimeout(resolve, delay));

// Check if video is private
function isPrivateVideo(): boolean {
    try {
        const badgeSelector = "#title > ytd-badge-supported-renderer > div.badge";
        const badgeElement = document.querySelector(badgeSelector);
        return badgeElement ? (badgeElement.textContent?.trim() ?? "").includes("Private") : false;
    } catch {
        return false;
    }
}

// Fetch YouTube page content
const fetchYouTubePageContent = async (videoId: string, maxRetries = 2): Promise<string> => retryWithBackoff(async () => {
    const fetchOptions: RequestInit = isPrivateVideo() ? {} : {
        "headers": {
            "DNT": "1",
            "Upgrade-Insecure-Requests": "1",
            "Cache-Control": "no-cache",
            "Cookie": ""
        },
        "credentials": "omit",
        "mode": "cors",
        "cache": "no-store"
    };
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const response = await fetch(youtubeUrl, fetchOptions);
    if (!response.ok)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const htmlContent = await response.text();
    if (!htmlContent || htmlContent.trim().length === 0)
        throw new Error("Empty response from YouTube");
    return htmlContent;
}, maxRetries, 500);

// Extract caption tracks from HTML
const extractCaptionTracks = (htmlContent: string): any[] => {
    const captionSplit = htmlContent.split('"captions":');
    if (captionSplit.length < 2)
        throw new Error("Youtube caption is not found");
    try {
        return JSON.parse(captionSplit[1].split(',"videoDetails')[0].replace(`\n`, "")).playerCaptionsTracklistRenderer.captionTracks;
    } catch {
        throw new Error("Youtube caption is not found");
    }
};

// Extract video title from HTML
const extractVideoTitle = (htmlContent: string): string => {
    const titleSplit = htmlContent.split('"title":"');
    if (titleSplit.length < 2)
        throw new Error("Youtube title is not found");
    return titleSplit[1].split('","lengthSeconds"')[0] ?? "";
};

// Parse available languages from HTML
const parseAvailableLanguages = (htmlContent: string): YoutubeLanguageOption[] => {
    if (!(htmlContent?.trim()))
        return [];
    try {
        const captionTracks = extractCaptionTracks(htmlContent);
        const videoTitle = extractVideoTitle(htmlContent);
        const languageMap = new Map(captionTracks.map((track: any) => [track.name.simpleText, track]));
        const languageKeys = Array.from(languageMap.keys());
        const preferredLanguage = "English";
        return languageKeys.sort((a, b) => a.includes(preferredLanguage) ? -1 : b.includes(preferredLanguage) ? 1 : 0)
            .sort((a, b) => a === preferredLanguage ? -1 : b === preferredLanguage ? 1 : 0)
            .map(languageKey => {
                const track = languageMap.get(languageKey);
                const vssId = track?.vssId;
                const cleanVssId = vssId?.startsWith(".") ? track.vssId.slice(1) : track?.vssId ?? "";
                return {
                    language: languageKey,
                    link: track?.baseUrl ?? "",
                    title: videoTitle,
                    vssId: cleanVssId
                };
            });
    } catch {
        return [];
    }
};

// Create transcript request body
function createTranscriptRequestBody(params: string): RequestInit {
    const e = Array.from({
        length: 30
    }, (_i, s) => {
        const a = new Date;
        return a.setDate(a.getDate() - s),
            a.toISOString().split("T")[0].replace(/-/g, "")
    }
    )
        , r = `2.${e[Math.floor(Math.random() * e.length)]}.00.00`;
    return {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            context: {
                client: {
                    clientName: "WEB",
                    clientVersion: r
                }
            },
            params
        })
    }
}

// Get transcript using YouTube internal API
async function getTranscriptFromInternalAPI(params = ""): Promise<TranscriptResult> {
    if (!params)
        return {
            transcripts: [],
            transcriptParams: []
        };
    try {
        return await retryWithBackoff(async () => {
            const apiResponse = await (await fetch("https://www.youtube.com/youtubei/v1/get_transcript?prettyPrint=false", createTranscriptRequestBody(params))).text();
            if (!apiResponse || apiResponse.trim().length === 0)
                throw new Error("Empty transcript response");
            let parsedResponse: any = null;
            try {
                parsedResponse = JSON.parse(apiResponse);
            } catch {
                throw new Error("Invalid JSON response");
            }
            try {
                const actions = parsedResponse?.actions;
                const updateAction = actions?.[0];
                const content = updateAction?.updateEngagementPanelAction;
                const renderer = content?.content;
                const transcriptContent = renderer?.transcriptRenderer;
                const searchPanel = transcriptContent?.content;
                const transcriptPanel = searchPanel?.transcriptSearchPanelRenderer ?? null;

                const segmentList = transcriptPanel?.body;
                const initialSegments = segmentList?.transcriptSegmentListRenderer;
                const segments = initialSegments?.initialSegments ?? [];
                let durationMs;

                const transcriptSegments = segments.map((segment: any) => {
                    const segmentRenderer = segment?.transcriptSegmentRenderer ?? {};
                    const { startMs: startTime, endMs: endTime, snippet: textSnippet } = segmentRenderer ?? {};
                    const runs = textSnippet?.runs;
                    const firstRun = runs?.[0];
                    const segmentText = firstRun?.text ?? "";
                    durationMs = parseInt(endTime) || null;

                    return !startTime || !endTime || !segmentText ? null : {
                        start: Math.round(Number(startTime) / 1000),
                        duration: Math.round((parseInt(endTime) - parseInt(startTime)) / 1000),
                        text: stripHtmlTags(decodeHtmlEntities(segmentText)).trim()
                    };
                }).filter(Boolean);

                const languageOptions: { lang: string; endpoint: string }[] = [];
                const footer = transcriptPanel?.footer;
                const footerRenderer = footer?.transcriptFooterRenderer;
                const languageMenu = footerRenderer?.languageMenu;
                const sortFilter = languageMenu?.sortFilterSubMenuRenderer;
                const subMenuItems = sortFilter?.subMenuItems ?? [];

                if (subMenuItems && Array.isArray(subMenuItems)) {
                    for (const menuItem of subMenuItems) {
                        const languageTitle = menuItem?.title ?? "";
                        const reloadData = menuItem?.continuation;
                        const continuation = reloadData?.reloadContinuationData;
                        const continuationEndpoint = continuation?.continuation ?? "";
                        if (languageTitle && continuationEndpoint) {
                            languageOptions.push({
                                lang: languageTitle,
                                endpoint: continuationEndpoint
                            });
                        }
                    }
                }

                if (transcriptSegments.length === 0)
                    throw new Error("No transcript entries found");

                return {
                    transcripts: transcriptSegments,
                    transcriptParams: languageOptions,
                    durationMs
                };
            } catch (error) {
                throw new Error("Error extracting transcript data: " + error);
            }
        }, MAX_RETRIES, RETRY_DELAY, (errorMsg = "") => errorMsg.includes("HTTP") || errorMsg.includes("Invalid JSON response") || errorMsg.includes("No transcript entries found"));
    } catch {
        return {
            transcripts: [],
            transcriptParams: []
        };
    }
}

// Strip HTML tags
function stripHtmlTags(htmlString: string): string {
    return htmlString.replace(/<[^>]*>/g, "");
}

// Decode HTML entities
function decodeHtmlEntities(encodedString: string): string {
    const entityMap: Record<string, string> = {
        "&#39;": "'",
        "&quot;": '"',
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&nbsp;": " ",
        "&iexcl;": "¡",
        "&cent;": "¢",
        "&pound;": "£",
        "&curren;": "¤",
        "&yen;": "¥",
        "&brvbar;": "¦",
        "&sect;": "§",
        "&uml;": "¨",
        "&copy;": "©",
        "&ordf;": "ª",
        "&laquo;": "«"
    };
    return encodedString.replace(/&#\d+;|&\w+;/g, entity => entityMap[entity] || entity);
}

const waitForTranscriptLoad = (selector: string): Promise<Element | null> => new Promise(resolve => {
    const interval = setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
            clearInterval(interval);
            resolve(element);
        }
    }, 100);
    setTimeout(() => {
        clearInterval(interval);
        resolve(null);
    }, 3000);
});

const parseTimestamp = (timeString: string): number => {
    const parts = timeString.split(":").map(Number);
    let totalSeconds = 0;
    if (parts.length === 3) {
        totalSeconds += parts[0] * 3600;
        totalSeconds += parts[1] * 60;
        totalSeconds += parts[2];
    } else if (parts.length === 2) {
        totalSeconds += parts[0] * 60;
        totalSeconds += parts[1];
    } else if (parts.length === 1) {
        totalSeconds += parts[0];
    }
    return totalSeconds;
};

// Extract transcript from DOM
async function extractTranscriptFromDom(_videoId = "", _language = ""): Promise<TranscriptSegment[]> {
    const transcriptButtonSelector = "#primary-button > ytd-button-renderer > yt-button-shape > button";
    const segmentSelector = "#segments-container > ytd-transcript-segment-renderer";
    try {
        const transcriptButton = document.querySelector(transcriptButtonSelector) as HTMLElement | null;
        if (!transcriptButton) return [];

        transcriptButton.click();
        await waitForTranscriptLoad(segmentSelector);

        return await retryWithBackoff(async () => {
            const segmentElements = document.querySelectorAll(segmentSelector);
            const transcriptSegments: TranscriptSegment[] = [];

            segmentElements.forEach((element, index) => {
                const timestampElement = element.querySelector("div.segment-timestamp");
                const timestampText = timestampElement?.textContent?.trim() ?? "";
                const formattedText = element.querySelector("yt-formatted-string");
                const cleanText = formattedText?.textContent?.trim() ?? "";

                if (timestampText && cleanText) {
                    const seconds = parseTimestamp(timestampText);
                    transcriptSegments.push({
                        index: index,
                        text: sanitizeText(cleanText),
                        start: Math.round(Number(seconds))
                    });
                }
            });

            if (transcriptSegments.length === 0)
                throw new Error("No segments found in the transcript panel");

            return transcriptSegments;
        }, MAX_RETRIES, RETRY_DELAY, (errorMsg = "") => errorMsg.includes("No segments found"));
    } catch {
        return [];
    }
}

// Get transcript via extension messaging
async function getTranscriptViaExtension(params: { videoId?: string; vssId?: string; title?: string }): Promise<TranscriptSegment[]> {
    const { videoId = "", vssId = "" } = params ?? {};
    if (!videoId && !vssId)
        return [];
    try {
        const extensionResponse = await chrome.runtime.sendMessage({
            action: "get_yt_scripts",
            title: params?.title ?? "",
            videoId: params?.videoId ?? "",
            vssId: params?.vssId ?? ""
        });
        const { transcripts: rawTranscripts = [] } = extensionResponse?.data ?? {};
        const processedTranscripts = rawTranscripts.map((transcript: any, index: number) => ({
            index: index,
            text: sanitizeText(transcript?.text ?? "").trim(),
            start: Math.round(Number(transcript.start))
        }));
        return processedTranscripts;
    } catch {
        return [];
    }
}

// Main transcript fetching function
async function fetchTranscriptWithFallbacks({
    link: captionUrl = "",
    videoId = "",
    lang: language = "",
    vssId = "",
    tryFallback: useFallback = false,
    transcriptParams = ""
}): Promise<{ transcripts: TranscriptSegment[]; durationMs?: number }> {
    if (!captionUrl || !videoId || !language)
        return { transcripts: [] };
    const isPrivate = isPrivateVideo();
    const fetchStrategies: (() => Promise<{ transcripts: TranscriptSegment[]; durationMs?: number } | null>)[] = [async () => {
        const apiResult = await getTranscriptFromInternalAPI(transcriptParams);
        const transcripts = apiResult?.transcripts;
        return transcripts?.length ? { transcripts: apiResult.transcripts, durationMs: apiResult.durationMs } : null;
    }];

    if (useFallback) {
        fetchStrategies.push(async () => {
            const domResult = await extractTranscriptFromDom(videoId, language);
            return domResult?.length ? { transcripts: domResult } : null;
        });
    }

    if (!isPrivate && vssId) {
        fetchStrategies.push(async () => {
            const extensionResult = await getTranscriptViaExtension({
                videoId: videoId,
                vssId: vssId
            });
            return extensionResult?.length ? { transcripts: extensionResult } : null;

        });
    }

    for (const strategy of fetchStrategies) {
        try {
            const result = await strategy();
            if (result && result.transcripts.length > 0) {
                return result;
            }
        } catch { }
    }
    return { transcripts: [] };

}

// Process raw transcripts into chunks
const processRawTranscripts = ({ rawTranscripts }: { rawTranscripts: TranscriptSegment[] }): ProcessedTranscript[] => {
    const processedChunks: ProcessedTranscript[] = [];
    let chunkCount = 0;
    let textChunks: string[] = [];
    let totalCharacters = 0;
    let timeDifference = 0;
    let currentChunk: Partial<ProcessedTranscript> = {};
    let pendingChunk: Partial<ProcessedTranscript> = {};

    function resetChunk() {
        chunkCount = 0;
        textChunks = [];
        totalCharacters = 0;
        timeDifference = 0;
        currentChunk = {};
    }

    rawTranscripts.forEach((transcript, index, array) => {
        if (pendingChunk.start && pendingChunk.text) {
            currentChunk.start = pendingChunk.start;
            textChunks.push(pendingChunk.text);
            pendingChunk = {};
        }

        if (chunkCount === 0) {
            currentChunk.start = pendingChunk.start ? pendingChunk.start : transcript.start;
        }

        chunkCount++;
        const chunkStartTime = Math.round(Number(currentChunk.start));
        timeDifference = Math.round(Number(transcript.start)) - chunkStartTime;
        totalCharacters += transcript.text.length;
        textChunks.push(transcript.text);

        if (index === array.length - 1) {
            currentChunk.text = textChunks.join(" ").replace(/\n/g, " ");
            processedChunks.push(currentChunk as ProcessedTranscript);
            resetChunk();
            return;
        }

        const MAX_TIME_GAP = 60;
        const MAX_CHUNK_SIZE = 300;
        const MIN_CHUNK_SIZE = 500;

        if (timeDifference > MAX_TIME_GAP) {
            currentChunk.text = textChunks.join(" ").replace(/\n/g, " ");
            processedChunks.push(currentChunk as ProcessedTranscript);
            resetChunk();
            return;
        }

        if (totalCharacters > MAX_CHUNK_SIZE) {
            if (totalCharacters < MIN_CHUNK_SIZE) {
                if (transcript.text.includes(".")) {
                    const sentences = transcript.text.split(".");
                    if (sentences[sentences.length - 1].replace(/\s+/g, "") === "") {
                        currentChunk.text = textChunks.join(" ").replace(/\n/g, " ");
                        processedChunks.push(currentChunk as ProcessedTranscript);
                        resetChunk();
                        return;
                    }
                    const lastSentence = sentences[sentences.length - 2];
                    const splitIndex = transcript.text.indexOf(lastSentence) + lastSentence.length + 1;
                    const firstPart = transcript.text.substring(0, splitIndex);
                    pendingChunk.text = transcript.text.substring(splitIndex);
                    pendingChunk.start = transcript.start;
                    textChunks.splice(textChunks.length - 1, 1, firstPart);
                    currentChunk.text = textChunks.join(" ").replace(/\n/g, " ");
                    processedChunks.push(currentChunk as ProcessedTranscript);
                    resetChunk();
                    return;
                } else {
                    return;
                }
            }
            currentChunk.text = textChunks.join(" ").replace(/\n/g, " ");
            processedChunks.push(currentChunk as ProcessedTranscript);
            resetChunk();
            return;
        }
    });

    return processedChunks;
};

// Format seconds to timestamp
const formatSecondsToTimestamp = (seconds: number): string => {
    const substringStart = seconds < 3600 ? 14 : 12;
    return new Date(seconds * 1000).toISOString().substring(substringStart, 19);
};

// Sanitize text content
const sanitizeText = (textContent: string): string => {
    const tempDiv = document.createElement("div");
    if (textContent && typeof textContent === "string") {
        tempDiv.innerHTML = textContent;
        const sanitized = tempDiv.textContent ?? "";
        tempDiv.textContent = "";
        return sanitized;
    }
    return textContent;
};

// Format transcript data to text
const formatTranscriptToText = ({ textData, withTimestamp: includeTimestamp }: { textData: YoutubeTextData[]; withTimestamp: boolean }): string =>
    textData.sort((a, b) => a.index - b.index)
        .map(item => includeTimestamp ? `(${formatSecondsToTimestamp(item.start)}) ${item.text}` : item.text)
        .join(" ");

const extractTranscriptEndpoint = (pageContent: string): string => {
    if (!pageContent?.trim())
        return "";
    try {
        const parts = pageContent.split('"getTranscriptEndpoint":');
        if (parts.length < 2)
            return "";
        const paramsPart = parts[1].split('"params":"')[1];
        if (!paramsPart) return "";
        const endpoint = paramsPart.split('"')[0];
        return endpoint || "";
    } catch {
        return "";
    }
};

const extractChannel = (pageContent: string): YoutubeChannel => {
    let channel: YoutubeChannel = {}
    if (!pageContent?.trim())
        return channel;
    try {
        const parts = pageContent.split('"videoOwnerRenderer":');
        if (parts.length < 2)
            return channel;
        let paramsPart = parts[1].split(',"width":88,"height":88},{"url":"')[1];
        if (!paramsPart) return channel;
        const avatarUrl = paramsPart.split('"')[0];
        if (avatarUrl) {
            channel.avatarUrl = avatarUrl;
        }
        paramsPart = paramsPart.split('"title":{"runs":[{"text":"')[1]
        if (!paramsPart) return channel;
        const name = paramsPart.split('"')[0];
        if (name) {
            channel.name = name;
        }
        paramsPart = paramsPart.split('"webCommandMetadata":{"url":"/@')[1]
        if (!paramsPart) return channel;
        const id = paramsPart.split('"')[0];
        if (id) {
            channel.id = id;
        }

        return channel;
    } catch {
        return channel;
    }
};

export async function getYouTubeTranscript({
    videoId,
    withTimestamp: includeTimestamp = true,
    tryFallback: useFallback = false
}: {
    videoId: string;
    withTimestamp?: boolean;
    tryFallback?: boolean;
}): Promise<YoutubeData> {
    const defaultResult: YoutubeData = {
        title: "",
        lang: "",
        text: "",
        textData: [],
        transcriptData: [],
        langOptions: [],
        channel: {}
    };

    if (!videoId)
        return defaultResult;

    try {
        return await retryWithBackoff(async () => {
            const result: YoutubeData = {
                title: "",
                lang: "",
                text: "",
                textData: [],
                transcriptData: [],
                channel: {},
                langOptions: []
            };

            const pageContent = await fetchYouTubePageContent(videoId);
            const channel = extractChannel(pageContent);
            const transcriptParams = extractTranscriptEndpoint(pageContent);
            const availableLanguages = parseAvailableLanguages(pageContent);

            if (!availableLanguages || availableLanguages.length === 0)
                throw new Error("No language options found");

            result.title = availableLanguages[0].title;
            result.lang = availableLanguages[0].language;
            result.langOptions = availableLanguages;
            result.channel = channel;

            const firstLanguageVssId = availableLanguages[0];
            const rawTranscripts = await fetchTranscriptWithFallbacks({
                link: availableLanguages[0].link,
                videoId: videoId,
                lang: result.lang,
                vssId: firstLanguageVssId?.vssId ?? "",
                tryFallback: useFallback,
                transcriptParams
            });

            if (!rawTranscripts || !rawTranscripts.transcripts || rawTranscripts.transcripts.length === 0)
                throw new Error("No raw transcripts retrieved");

            const processedTranscripts = processRawTranscripts({
                rawTranscripts: rawTranscripts.transcripts

            });

            result.durationMs = rawTranscripts.durationMs;
            result.transcriptData = processedTranscripts.map(chunk => {
                const startSeconds = Math.round(Number(chunk.start));
                const timeText = formatSecondsToTimestamp(startSeconds);
                const transcriptText = chunk.text ?? "";
                return {
                    videoId: videoId,
                    seconds: startSeconds,
                    timeText: timeText,
                    transcriptText: transcriptText
                };
            });

            result.textData = Array.from(processedTranscripts).map((chunk, index) => ({
                index: index,
                text: sanitizeText(chunk.text ?? "").trim(),
                start: Math.round(Number(chunk.start))
            }));

            result.text = formatTranscriptToText({
                textData: result.textData,
                withTimestamp: includeTimestamp
            });

            return result;
        }, MAX_RETRIES, RETRY_DELAY, () => true);
    } catch {
        return defaultResult;
    }
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request: MessageYoutubeTranscriptRequest,
    _sender,
    sendResponse: (response: MessageYoutubeTranscriptResponse) => void) => {
    if (request.action === GET_YOUTUBE_TRANSCRIPT) {
        const { videoId, withTimestamp = true, tryFallback = false } = request;

        // Use the content-window.ts functionality
        getYouTubeTranscript({ videoId, withTimestamp, tryFallback })
            .then((result: any) => {
                sendResponse({ success: true, data: result });
            })
            .catch((error: any) => {
                sendResponse({ success: false, error: error.message });
            });

        // Return true to indicate we'll send a response asynchronously
        return true;
    }
});