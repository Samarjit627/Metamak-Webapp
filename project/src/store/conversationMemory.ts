// conversationMemory.ts

import create from 'zustand';

interface ConversationMemoryState {
  history: string[];
  addToHistory: (message: string) => void;
}

export const useConversationMemory = create<ConversationMemoryState>((set) => ({
  history: [],
  addToHistory: (message) => set((state) => ({ history: [...state.history, message] })),
}));
