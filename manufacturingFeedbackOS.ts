// manufacturingFeedbackOS.ts
export type FeedbackEntry = {
  partId: string;
  user: string;
  suggestion: string;
  accepted: boolean;
  timestamp: string;
};

let feedbackHistory: FeedbackEntry[] = [];

export function logFeedback(entry: FeedbackEntry) {
  feedbackHistory.push(entry);
}

export function getFeedbackForPart(partId: string): FeedbackEntry[] {
  return feedbackHistory.filter(e => e.partId === partId);
}
