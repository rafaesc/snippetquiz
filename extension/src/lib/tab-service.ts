import { Readability } from "@mozilla/readability";

interface TabContentData {
  pageTitle: string;
  sourceUrl: string;
  content: string;
}

class TabService {
  /**
   * Processes HTML content using Readability to extract clean text
   * @param htmlContent Raw HTML content
   * @returns Processed text content
   */
  private processHtmlContent(htmlContent: string): string {
    try {
      // Create a temporary DOM document from the HTML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");

      const reader = new Readability(doc);
      const article = reader.parse();
      return article?.textContent || htmlContent;
    } catch (error) {
      console.error("Error processing HTML content:", error);
      return htmlContent;
    }
  }

  async getCurrentTab(): Promise<chrome.tabs.Tab | null> {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    return tab;
  }

  /**
   * Gets comprehensive data from the current active tab
   * @returns Promise<TabContentData> Object containing pageTitle, sourceUrl, and content
   */
  async getCurrentTabHTMLContent(): Promise<TabContentData> {
    try {
      // Get the current active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab || !tab.id) {
        throw new Error("No active tab found");
      }

      // Check if the tab URL is accessible
      if (
        tab.url &&
        (tab.url.startsWith("chrome://") ||
          tab.url.startsWith("chrome-extension://"))
      ) {
        throw new Error("Cannot access content of this tab type");
      }

      // Get page content using script injection
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Try to get main content, fallback to body, then html
          const main = document.querySelector("main");
          const article = document.querySelector("article");
          const content = document.querySelector('[role="main"]');

          let innerHTML = "";

          if (main) {
            innerHTML = main.innerHTML;
          } else if (article) {
            innerHTML = article.innerHTML;
          } else if (content) {
            innerHTML = content.innerHTML;
          } else {
            // Fallback to body innerHTML
            innerHTML = document.body.innerHTML;
          }

          return {
            content: innerHTML,
            url: window.location.href,
          };
        },
      });

      if (!results || results.length === 0) {
        throw new Error("Failed to execute script in tab");
      }

      const scriptResult = results[0].result as {
        content: string;
        url: string;
      };

      // Process the HTML content using Readability
      const processedContent = this.processHtmlContent(scriptResult.content);

      return {
        pageTitle: tab.title || "Untitled",
        sourceUrl: scriptResult.url || tab.url || "",
        content: processedContent,
      };
    } catch (error) {
      console.error("Error getting tab data:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const tabService = new TabService();
export default tabService;
