export const VALIDATION_MESSAGE_PATTERNS = {
  TOKEN: String.raw`[+-]?[A-Za-z0-9]+(?:[.,:/_%+–−-][A-Za-z0-9]+)*%?`,
} as const;

export const VALIDATION_MESSAGE_REGEX = {
  TECHNICAL: new RegExp(
    `${VALIDATION_MESSAGE_PATTERNS.TOKEN}(?:[ \t]+${VALIDATION_MESSAGE_PATTERNS.TOKEN})*`,
    "g",
  ),
} as const;
