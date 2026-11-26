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

export interface IJennyThreadSource extends IJennySource {
  hasTrustedUrl: boolean;
}

export interface IJennyThreadMessage extends IJennyChatMessage {
  id: string;
  sources: IJennyThreadSource[];
}

export interface IAskJennyInput {
  signal: AbortSignal;
  context: IJennyContext;
  messages: IJennyThreadMessage[];
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
  inputRef: RefObject<HTMLElement | null>;
}

export interface ITransitionDuration {
  exit: number;
  enter: number;
}

export interface IJennyChat {
  draft: string;
  canSend: boolean;
  isWaiting: boolean;
  hasMessages: boolean;
  announcement: string;
  canStartNewChat: boolean;
  startNewChat: () => void;
  retry: () => Promise<void>;
  sendDraft: () => Promise<void>;
  messages: IJennyThreadMessage[];
  setDraft: (draft: string) => void;
  error: IJennyErrorFeedback | null;
}

export interface IJennyMarkSize {
  size: number;
  iconSize: number;
}
