import type { IQuotation, IRecommendedCloneCommand } from "./quotation.interface";

export interface ICloneFailure {
  title: string;
  lines: string[];
  staleSource: boolean;
}

export interface ICloneExecution {
  targetBrand: string;
  sourceVersion: number;
  onPending: (pending: boolean) => void;
  onFailure: (failure: ICloneFailure | null) => void;
  execute: (command: IRecommendedCloneCommand) => Promise<IQuotation>;
  onSuccess: (quotation: IQuotation, isCurrent: () => boolean) => void | Promise<void>;
}
