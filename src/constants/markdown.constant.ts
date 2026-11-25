export const MARKDOWN_BLOCK_KINDS = {
  PARAGRAPH: "paragraph",
  ORDERED_LIST: "orderedList",
  UNORDERED_LIST: "unorderedList",
} as const;

export type MarkdownBlockKindType =
  (typeof MARKDOWN_BLOCK_KINDS)[keyof typeof MARKDOWN_BLOCK_KINDS];

export const MARKDOWN_PATTERNS = {
  LINE_BREAK: /\r?\n/,
  BLANK_LINE: /\r?\n\s*\r?\n/,
  BOLD_SEGMENT: /\*\*(.+?)\*\*/,
  ORDERED_ITEM: /^\s*\d+[.)]\s+/,
  UNORDERED_ITEM: /^\s*[-*•]\s+/,
  LEADING_SPACE: /^\s+/,
} as const;

export const MARKDOWN_MARKER_BY_KIND: Record<MarkdownBlockKindType, RegExp> = {
  [MARKDOWN_BLOCK_KINDS.PARAGRAPH]: MARKDOWN_PATTERNS.LEADING_SPACE,
  [MARKDOWN_BLOCK_KINDS.ORDERED_LIST]: MARKDOWN_PATTERNS.ORDERED_ITEM,
  [MARKDOWN_BLOCK_KINDS.UNORDERED_LIST]: MARKDOWN_PATTERNS.UNORDERED_ITEM,
};

export const MARKDOWN_LIST_KINDS = [
  MARKDOWN_BLOCK_KINDS.ORDERED_LIST,
  MARKDOWN_BLOCK_KINDS.UNORDERED_LIST,
] as const;
