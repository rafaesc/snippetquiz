export { };

declare global {
    interface Window {
        __ENV: {
            API_BASE_URL: string;
        };
    }
}
