import { create } from "zustand";

interface IDriveFeedbackStore {
  message: string;
  projectId: string | null;
  clear: (projectId: string) => void;
  show: (projectId: string, message: string) => void;
}

export const useDriveFeedbackStore = create<IDriveFeedbackStore>(set => ({
  message: "",
  clear: projectId => set({ projectId, message: "" }),
  projectId: null,
  show: (projectId, message) => set({ projectId, message }),
}));
