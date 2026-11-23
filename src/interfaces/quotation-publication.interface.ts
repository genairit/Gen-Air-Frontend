import type {
  PublicationKindType,
  PublicationStateType,
} from "../constants/quotation-publication.constant";

export interface IQuotationPublicationStage {
  cycleId: string;
  generation: number;
  reason: string | null;
  sourceVersion: number;
  fileUrl: string | null;
  updatedAt: string | null;
  state: PublicationStateType;
  lifecycleEventId: string | null;
  destinationLabel: string | null;
  documentKind: PublicationKindType;
}
export interface IQuotationPublication {
  canRetry: boolean;
  reason: string | null;
  cycleId: string | null;
  fileUrl: string | null;
  updatedAt: string | null;
  generation: number | null;
  state: PublicationStateType;
  sourceVersion: number | null;
  destinationLabel: string | null;
  history: IQuotationPublicationStage[];
  documentKind: PublicationKindType | null;
}
export interface IQuotationPublicationRetry {
  cycleId: string;
  generation: number;
}
export interface IQuotationPublicationState {
  busy: boolean;
  refreshing: boolean;
  error: string | null;
  retryRequested?: boolean;
  retry: () => Promise<void>;
  refresh: () => Promise<void>;
  publication: IQuotationPublication | null;
}
