import { create } from 'zustand';

interface ChatMetrics {
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  longestConversation: number;
  averageResponseTime: number;
  totalTokens: number;
  totalCost: number;
  dropOffPoints: number[];
  helpfulFeedback: number;
  unhelpfulFeedback: number;
}

interface ChatMetricsState extends ChatMetrics {
  addMessage: (type: 'user' | 'assistant', responseTime?: number, tokens?: number, cost?: number) => void;
  addFeedback: (messageIndex: number, isHelpful: boolean) => void;
  resetMetrics: () => void;
}

const initialMetrics: ChatMetrics = {
  totalMessages: 0,
  userMessages: 0,
  assistantMessages: 0,
  longestConversation: 0,
  averageResponseTime: 0,
  totalTokens: 0,
  totalCost: 0,
  dropOffPoints: [],
  helpfulFeedback: 0,
  unhelpfulFeedback: 0
};

export const useChatMetricsStore = create<ChatMetricsState>((set) => ({
  ...initialMetrics,

  addMessage: (type, responseTime = 0, tokens = 0, cost = 0) => set((state) => {
    const newState = {
      totalMessages: state.totalMessages + 1,
      userMessages: type === 'user' ? state.userMessages + 1 : state.userMessages,
      assistantMessages: type === 'assistant' ? state.assistantMessages + 1 : state.assistantMessages,
      longestConversation: Math.max(state.longestConversation, state.totalMessages + 1),
      averageResponseTime: type === 'assistant' 
        ? ((state.averageResponseTime * state.assistantMessages) + responseTime) / (state.assistantMessages + 1)
        : state.averageResponseTime,
      totalTokens: state.totalTokens + tokens,
      totalCost: state.totalCost + cost
    };

    // Check for potential drop-off points
    if (type === 'assistant' && state.totalMessages > 0) {
      const timeSinceLastMessage = Date.now() - (state.dropOffPoints[state.dropOffPoints.length - 1] || 0);
      if (timeSinceLastMessage > 300000) { // 5 minutes
        return {
          ...newState,
          dropOffPoints: [...state.dropOffPoints, state.totalMessages]
        };
      }
    }

    return newState;
  }),

  addFeedback: (messageIndex, isHelpful) => set((state) => ({
    helpfulFeedback: isHelpful ? state.helpfulFeedback + 1 : state.helpfulFeedback,
    unhelpfulFeedback: isHelpful ? state.unhelpfulFeedback : state.unhelpfulFeedback + 1
  })),

  resetMetrics: () => set(initialMetrics)
}));

// Export the addMetricsMessage function that uses the store's addMessage method
export const addMetricsMessage = (
  type: 'user' | 'assistant',
  responseTime?: number,
  tokens?: number,
  cost?: number
) => {
  const store = useChatMetricsStore.getState();
  store.addMessage(type, responseTime, tokens, cost);
};