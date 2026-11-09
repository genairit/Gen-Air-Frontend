import type {
  IProjectPayload,
  IProjectStageMovePayload,
} from "../interfaces/api-request.interface";

import {
  STAGE_REASON_COPY,
  WAITING_FOR_RESPONSE_STAGE_ID,
} from "../constants/project-stage.constant";

import { isolateText } from "./text.utility";
import { getFullName } from "./mappers/user.mapper";
import { VALID_FIELD } from "./field-feedback.utility";
import { DATE_FORMAT } from "../constants/date.constants";
import { formatDate, normalizeDate } from "./date.utility";
import { USER_ROLE_LABELS } from "../constants/user-role.constant";
import type { IApiStageTransition } from "../interfaces/api.interface";
import type { IValidationResult } from "../interfaces/validation-result.interface";
import type { IStageMove, IProjectFormValues } from "../interfaces/project.interface";

interface IStageChange {
  stageId: string | null;
  originalStageId: string | null;
}

interface IWaitingReasonSource {
  waitingReason: string | null;
  latestTransition: IApiStageTransition | null;
}

export const isWaitingForResponseStage = (stageId?: string | null) =>
  stageId === WAITING_FOR_RESPONSE_STAGE_ID;

export const requiresStageNote = ({ stageId, originalStageId }: IStageChange) =>
  isWaitingForResponseStage(stageId) && !isWaitingForResponseStage(originalStageId);

export const validateStageReason = (reason: string): IValidationResult => {
  if (!reason.trim()) {
    return { isValid: false, errorText: STAGE_REASON_COPY.REQUIRED_ERROR };
  }

  return VALID_FIELD;
};

export const toStageReasonValidator = (isRevealed: boolean) => (reason: string) => {
  if (!isRevealed) {
    return VALID_FIELD;
  }

  return validateStageReason(reason);
};

const toOptionalNote = (note?: string | null) => note?.trim() || null;

export const toStageMovePayload = ({ stageId, note }: IStageMove): IProjectStageMovePayload => {
  const trimmedNote = toOptionalNote(note);

  if (!trimmedNote) {
    return { stageId };
  }

  return { stageId, note: trimmedNote };
};

export const toStageNotePayload = ({
  values,
  originalStageId,
}: {
  values: IProjectFormValues;
  originalStageId: string | null;
}): Pick<IProjectPayload, "stageNote"> => {
  const stageNote = toOptionalNote(values.stageNote);
  const isStageNoteRequired = requiresStageNote({ stageId: values.stageId, originalStageId });

  if (!isStageNoteRequired || !stageNote) {
    return {};
  }

  return { stageNote };
};

export const countStageNoteErrors = (change: IStageChange & { stageNote: string }) =>
  Number(requiresStageNote(change) && !validateStageReason(change.stageNote).isValid);

export const toTransitionNote = (transition: IApiStageTransition) =>
  toOptionalNote(transition.note);

export const formatTransitionActor = (transition: IApiStageTransition) => {
  if (!transition.changedBy) {
    return USER_ROLE_LABELS[transition.changedByRole];
  }

  return getFullName(transition.changedBy);
};

const formatWaitingReasonMeta = (transition: IApiStageTransition) => {
  const date = formatDate(normalizeDate(transition.createdAt), DATE_FORMAT.FULL_DATE);
  const actor = formatTransitionActor(transition);

  return `${STAGE_REASON_COPY.BANNER_UPDATED_PREFIX} ${isolateText(date)} · ${isolateText(actor)}`;
};

export const toWaitingReasonLines = ({ waitingReason, latestTransition }: IWaitingReasonSource) => {
  const reason = toOptionalNote(waitingReason);

  if (!reason) {
    return [STAGE_REASON_COPY.BANNER_EMPTY];
  }

  const isReasonTransition = latestTransition && toTransitionNote(latestTransition) === reason;

  if (!isReasonTransition) {
    return [isolateText(reason)];
  }

  return [isolateText(reason), formatWaitingReasonMeta(latestTransition)];
};
