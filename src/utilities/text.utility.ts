export const formatFileCount = (count: number) => `${count} קבצים`;

export const formatVisibleCount = ({ visible, total }: { visible: number; total: number }) =>
  `מציג ${visible} מתוך ${total} עובדים רשומים`;

const MAX_INITIALS = 2;

export const getInitials = (fullName: string) =>
  fullName
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0))
    .join("")
    .slice(0, MAX_INITIALS);

export const formatActiveStageCount = (count: number) => `${count} שלבים פעילים`;

export const formatTeamBadge = (count: number) => `${count} חברי צוות`;

export const formatUpdatesBadge = (count: number) => `${count} עדכונים`;

export const formatStageLabel = (stageLabel: string) => `שלב: ${stageLabel}`;

export const formatRolesBadge = (count: number) => `${count} תפקידים מוגדרים`;

export const formatErpSyncCaption = (prefix: string, syncedAt: string) => `${prefix} · ${syncedAt}`;
