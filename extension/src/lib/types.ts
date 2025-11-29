export type MessageYoutubeTranscriptRequest = {
    action: "getYouTubeTranscript";
    videoId: string;
    withTimestamp?: boolean;
    tryFallback?: boolean;
}
export type YoutubeLanguageOption = {
    language: string;
    link: string;
    title: string;
    vssId: string;
}

export type YoutubeTranscriptData = {
    videoId: string;
    seconds: number;
    timeText: string;
    transcriptText: string;
}

export type YoutubeTextData = {
    index: number;
    text: string;
    start: number;
}

export type YoutubeChannel = {
    name?: string | null,
    id?: string | null,
    avatarUrl?: string | null
}

export type YoutubeData = {
    title: string;
    lang: string;
    text: string;
    textData: YoutubeTextData[];
    transcriptData: YoutubeTranscriptData[];
    langOptions: YoutubeLanguageOption[];
    channel: YoutubeChannel;
    durationMs?: number;
}

export type MessageYoutubeTranscriptResponse = {
    success: true;
    data: YoutubeData;
} | {
    success: false;
    error: string;
}