export const PAGINATION = {
  GAP: "gap",
  ELLIPSIS: "…",
  SIBLING_COUNT: 1,
} as const;

export type PaginationItemType = number | typeof PAGINATION.GAP;
