import type { QueryClient } from "@tanstack/react-query";
import type { NavigateFunction } from "react-router-dom";
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

export interface ICloneRefreshResult {
  isSuccess: boolean;
}

export interface ICloneRefreshInput {
  refresh: () => Promise<ICloneRefreshResult>;
  onFailure: (failure: ICloneFailure | null) => void;
}

export interface ICloneCompletionInput {
  quotation: IQuotation;
  queryClient: QueryClient;
  isCurrent: () => boolean;
  navigate: NavigateFunction;
}

export interface ICloneBrandOption {
  value: string;
  label: string;
}
