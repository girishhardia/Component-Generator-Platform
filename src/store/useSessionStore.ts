import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// Define types for our state
type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

type GeneratedCode = {
  tsx: string;
  css: string;
};

type SessionState = {
  token: string | null;
  activeSessionId: string | null;
  sessionName: string;
  chatHistory: ChatMessage[];
  generatedCode: GeneratedCode;
  isLoadingAI: boolean;
  error: string | null;
};

type SessionActions = {
  setToken: (token: string | null) => void;
  setActiveSessionId: (id: string) => void;
  startNewSession: () => void;
  loadSession: (session: { _id: string; name: string; chatHistory: ChatMessage[]; generatedCode: GeneratedCode }) => void;
  addChatMessage: (message: ChatMessage) => void;
  setGeneratedCode: (code: GeneratedCode) => void;
  setAILoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  updateCode: (type: 'tsx' | 'css', content: string) => void;
};

const initialState: Omit<SessionState, 'token'> = {
  activeSessionId: null,
  sessionName: 'New Project',
  chatHistory: [],
  generatedCode: {
    tsx: `// Your React component will appear here`,
    css: `/* Your component's CSS will appear here */`,
  },
  isLoadingAI: false,
  error: null,
};

export const useSessionStore = create<SessionState & SessionActions>()(
  immer((set) => ({
    token: null,
    ...initialState,

    setToken: (token) => {
      set((state) => {
        state.token = token;
        if (typeof window !== 'undefined') {
          if (token) {
            localStorage.setItem('auth-token', token);
          } else {
            localStorage.removeItem('auth-token');
          }
        }
      });
    },

    setActiveSessionId: (id: string) => {
      set((state) => {
          state.activeSessionId = id;
      });
    },

    startNewSession: () => {
      set((state) => {
        state.activeSessionId = null;
        state.sessionName = 'New Project';
        state.chatHistory = [];
        state.generatedCode = {
          tsx: `// Your React component will appear here`,
          css: `/* Your component's CSS will appear here */`,
        };
        state.error = null;
      });
    },

    loadSession: (session) => {
      set((state) => {
        state.activeSessionId = session._id;
        state.sessionName = session.name;
        state.chatHistory = session.chatHistory;
        state.generatedCode = session.generatedCode;
        state.error = null;
      });
    },
    
    addChatMessage: (message) => {
      set((state) => {
        state.chatHistory.push(message);
      });
    },

    setGeneratedCode: (code) => {
      set((state) => {
        state.generatedCode = code;
      });
    },

    setAILoading: (isLoading) => {
      set((state) => {
        state.isLoadingAI = isLoading;
      });
    },

    setError: (error) => {
      set((state) => {
        state.error = error;
      });
    },

    updateCode: (type, content) => {
      set((state) => {
        state.generatedCode[type] = content;
      });
    },
  }))
);