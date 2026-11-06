import { createContext } from "react";

export interface ISharedDocumentContext {
  canSelect: boolean;
  isPending: boolean;
  selectedFileId: string | null;
  selectFile: (fileId: string) => void;
}

export const SharedDocumentContext = createContext<ISharedDocumentContext | null>(null);
