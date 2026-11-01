import type {
  IApiDriveItem,
  IApiDriveFolder,
  IApiProjectType,
  IApiProjectStage,
  IApiStageTransition,
} from "../../interfaces/api.interface";

import type {
  IStatusStage,
  IProjectFile,
  IProjectFolder,
  ITimelineEntry,
  IProjectSummary,
  IProjectTypeOption,
} from "../../interfaces/project.interface";

import { getFullName } from "./user.mapper";
import { formatFileSize } from "../file.utility";
import { theme } from "../../constants/theme.constants";
import { formatApartmentCount } from "../apartment.utility";
import { DATE_FORMAT } from "../../constants/date.constants";
import { getInitials, formatErpSyncCaption } from "../text.utility";
import { USER_ROLE_LABELS } from "../../constants/user-role.constant";
import { ICON_NAMES, type IconNameType } from "../../constants/icon.constant";
import type { IProjectListItem } from "../../interfaces/project-list.interface";
import { formatDate, formatRelativeTime, normalizeDate } from "../date.utility";
import { ERP_SYNC_PREFIX, ERP_NOT_SYNCED_CAPTION } from "../../constants/project.constant";

const ICON_NAME_VALUES: readonly string[] = Object.values(ICON_NAMES);

const isIconName = (value?: string | null): value is IconNameType =>
  Boolean(value) && ICON_NAME_VALUES.includes(value ?? "");

const SPREADSHEET_MIME_PATTERN = /spreadsheet|excel|csv/i;

const getDriveItemIcon = (item: IApiDriveItem): IconNameType => {
  if (item.isFolder) {
    return ICON_NAMES.FOLDER;
  }

  if (SPREADSHEET_MIME_PATTERN.test(item.mimeType)) {
    return ICON_NAMES.REPORT;
  }

  return ICON_NAMES.DOCUMENT;
};

const getMemberInitials = (project: IProjectListItem) =>
  (project.members ?? []).flatMap(member =>
    member.user ? [getInitials(getFullName(member.user))] : [],
  );

const toApartmentsLabel = (project: IProjectListItem) => {
  if (project.parentProjectId || !project.projectType?.canHaveApartments) {
    return null;
  }

  return formatApartmentCount(project.apartmentCount ?? 0);
};

export const toProjectSummary = (project: IProjectListItem): IProjectSummary => ({
  id: project.id,
  apartmentsLabel: toApartmentsLabel(project),
  progress: null,
  code: project.code,
  name: project.name,
  teamInitials: getMemberInitials(project),
  type: project.projectType?.name ?? "",
  updatedLabel: formatRelativeTime(project.updatedAt),
});

export const toStatusStage = (stage: IApiProjectStage): IStatusStage => ({
  id: stage.id,
  name: stage.name,
  tag: stage.tag ?? "",
  description: stage.description ?? "",
});

export const toProjectTypeOption = (projectType: IApiProjectType): IProjectTypeOption => ({
  id: projectType.id,
  title: projectType.name,
  tag: projectType.tag ?? "",
  subtitle: projectType.subtitle ?? "",
  description: projectType.description ?? "",
  icon: isIconName(projectType.icon) ? projectType.icon : ICON_NAMES.MORE,
});

const formatTransitionAuthor = (transition: IApiStageTransition) => {
  const roleLabel = USER_ROLE_LABELS[transition.changedByRole];

  if (!transition.changedBy) {
    return `שונה ע״י ${roleLabel}`;
  }

  return `שונה ע״י ${getFullName(transition.changedBy)} (${roleLabel})`;
};

export const toTimelineEntry = (
  transition: IApiStageTransition,
  index: number,
): ITimelineEntry => ({
  id: transition.id,
  isHighlighted: index === 0,
  author: formatTransitionAuthor(transition),
  label: transition.toStage?.name ?? "",
  date: formatDate(normalizeDate(transition.createdAt), DATE_FORMAT.FULL_DATE),
  dotColor: transition.toStage?.color ?? theme.palette.statusGray,
});

export const toProjectFolder = (folder: IApiDriveFolder): IProjectFolder => ({
  id: folder.id,
  name: folder.name,
  icon: ICON_NAMES.FOLDER,
  fileCount: folder.fileCount,
  contentStatus: folder.contentStatus,
});

export const toProjectFile = (item: IApiDriveItem): IProjectFile => ({
  id: item.id,
  name: item.name,
  url: item.webViewLink ?? "",
  icon: getDriveItemIcon(item),
  meta: [formatFileSize(item.size), formatRelativeTime(item.modifiedTime)]
    .filter(Boolean)
    .join(" · "),
});

export const toErpSyncCaption = (prioritySyncedAt: string | null) => {
  if (!prioritySyncedAt) {
    return ERP_NOT_SYNCED_CAPTION;
  }

  const syncedAt = formatDate(normalizeDate(prioritySyncedAt), DATE_FORMAT.FULL_DATE);

  return formatErpSyncCaption(ERP_SYNC_PREFIX, syncedAt);
};
