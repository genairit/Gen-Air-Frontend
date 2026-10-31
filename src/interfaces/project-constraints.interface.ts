export interface IProjectNameCheckState {
  isTaken: boolean;
  isCheckFailed: boolean;
}

export interface IProjectNameAvailabilityRequest {
  name: string;
  signal: AbortSignal;
  excludeId: string | null;
}
