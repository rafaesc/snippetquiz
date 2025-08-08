export function isYouTubeTab(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com';
    } catch {
        return false;
    }
}

export function extractVideoId(url: string): string | null {
    try {
        const urlObj = new URL(url);
        const videoId = urlObj.searchParams.get('v');
        return videoId;
    } catch {
        return null;
    }
}