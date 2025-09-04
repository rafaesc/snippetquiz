export type ContentEntryEventPayload = {
  userId: string;
  contentId: string;
  action: 'GENERATE' | 'SAVE';
  content?: string;
  topics?: string[];
  pageTitle?: string;
  existingTopics?: string;
}