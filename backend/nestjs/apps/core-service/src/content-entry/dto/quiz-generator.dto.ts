export interface ContentEntry {
  id: number;
  pageTitle: string;
  content: string;
  wordCountAnalyzed: number;
}

export interface GenerateQuizRequest {
  instructions: string;
  contentEntries: ContentEntry[];
}

