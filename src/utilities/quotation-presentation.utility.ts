import { formatRelativeTime } from "./date.utility";

export const quotationSaveLabel = ({
  busy,
  dirty,
  updatedAt,
}: {
  busy: boolean;
  dirty: boolean;
  updatedAt: string;
}): string => {
  if (busy) {
    return "שומר...";
  }
  if (dirty) {
    return "שינויים ממתינים לשמירה";
  }
  return `נשמר בשרת · ${formatRelativeTime(updatedAt)}`;
};
