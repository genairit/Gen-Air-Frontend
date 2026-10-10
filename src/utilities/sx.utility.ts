import type { SxProps, Theme } from "@mui/material";

type SxEntryType = SxProps<Theme> | null | false;

const toSxArray = (entry: SxEntryType) => {
  if (!entry) {
    return [];
  }

  if (Array.isArray(entry)) {
    return entry;
  }

  return [entry];
};

export const mergeSx = (...entries: SxEntryType[]): SxProps<Theme> => entries.flatMap(toSxArray);
