import {
  PUBLICATION_POLL,
  PUBLICATION_STATE,
  PUBLICATION_LABELS,
  PUBLICATION_KIND_LABELS,
} from "../constants/quotation-publication.constant";

import type {
  IQuotationPublication,
  IQuotationPublicationStage,
} from "../interfaces/quotation-publication.interface";

import type { PublicationStateType } from "../constants/quotation-publication.constant";

export const isPublicationPending = (state: PublicationStateType | null): boolean => {
  const pendingStates: readonly (PublicationStateType | null)[] = [
    PUBLICATION_STATE.QUEUED,
    PUBLICATION_STATE.RENDERING,
    PUBLICATION_STATE.PUBLISHING,
    PUBLICATION_STATE.ARCHIVING,
    PUBLICATION_STATE.RECONCILING,
  ];
  return pendingStates.includes(state);
};
export const publicationLabel = (
  publication: Pick<IQuotationPublication, "state" | "reason">,
): string => {
  const archiveReason =
    publication.state === PUBLICATION_STATE.ARCHIVED ? publication.reason : null;
  return archiveReason ?? PUBLICATION_LABELS[publication.state];
};
export const publicationDescription = (
  publication: Pick<
    IQuotationPublication,
    "state" | "documentKind" | "sourceVersion" | "destinationLabel" | "reason"
  >,
): string[] => {
  const kind =
    publication.documentKind === null ? null : PUBLICATION_KIND_LABELS[publication.documentKind];
  const revision = publication.sourceVersion === null ? null : `גרסה ${publication.sourceVersion}`;
  const document = [kind, revision, publication.destinationLabel]
    .filter((value): value is string => value !== null)
    .join(" · ");
  const reason = publication.state === PUBLICATION_STATE.ARCHIVED ? null : publication.reason;
  return [document, reason].filter((value): value is string => value !== null && value.length > 0);
};
export const publicationHistoryDescription = (stage: IQuotationPublicationStage): string =>
  [publicationLabel(stage), ...publicationDescription(stage)].join(" · ");

export const publicationPollInterval = (
  state: PublicationStateType | null,
  hasError: boolean,
): number | false => {
  if (!isPublicationPending(state)) {
    return false;
  }

  return hasError ? PUBLICATION_POLL.RECOVERY_INTERVAL_MS : PUBLICATION_POLL.INTERVAL_MS;
};
