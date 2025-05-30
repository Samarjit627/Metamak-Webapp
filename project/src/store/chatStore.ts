import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  // Message type for visual distinction and logic
  type: 'user' | 'assistant' | 'system' | 'tool';
  // Optionally specify a role for future extensibility (e.g., 'error', 'info', 'warning')
  role?: 'user' | 'assistant' | 'system' | 'tool' | 'error' | 'info' | 'warning';
  content: string;
  toolUsed?: import('../gptTools').GPTTool;
  inputs?: object;
  timestamp: Date;
  attachment?: {
    type: 'image' | 'pdf';
    url: string;
    name: string;
  };
}

interface ChatState {
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  resetChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...message, id: uuidv4(), timestamp: new Date() }
      ]
    })),
  resetChat: () =>
    set({
      messages: []
    })
}));