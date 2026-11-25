import type { ReactNode, RefObject } from "react";
import type { JennyRoleType, JennyContextType } from "../constants/jenny.constant";

export interface IJennyContext {
  id: string;
  type: JennyContextType;
}

export interface IJennySource {
  url: string;
  fileId: string;
  fileName: string;
  page: number | null;
}

export interface IJennyChatMessage {
  content: string;
  role: JennyRoleType;
}

export interface IJennyThreadMessage extends IJennyChatMessage {
  id: string;
  sources: IJennySource[];
}

export interface IJennyChatRequest {
  context: IJennyContext;
  messages: IJennyChatMessage[];
}

export interface IJennyChatResponse {
  message: string;
  sources: IJennySource[];
}

export interface IJennyErrorFeedback {
  message: string;
  canRetry: boolean;
}

export interface IJennySurfaceProps {
  isOpen: boolean;
  panelId: string;
  titleId: string;
  children: ReactNode;
  onClose: () => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
}
