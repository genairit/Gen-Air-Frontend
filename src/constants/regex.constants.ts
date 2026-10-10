interface IRegex {
  [key: string]: RegExp;
}

export const REGEX_SANITIZATION = {
  WHITESPACE: /\s+/g,
  SPECIAL_CHARS: /[^a-zA-Z0-9א-ת]/g,
  HEBREW_NAME_REGEX: /^[\u05D0-\u05EA]+(?:[\s'-][\u05D0-\u05EA]+)*'?$/,
} as const satisfies IRegex;

export const REGEX_VALIDATION = {
  DIGITS_ONLY: /^\d+$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ISRAELI_PHONE_NUMBER: /^(05)([0-578])([0-9]{7})$/,
  FLEXIBLE_HEBREW_NAME: /^[\u05D0-\u05EA'-]+( [\u05D0-\u05EA'-]+)*$/, // Flexible Hebrew name: allows Hebrew letters, apostrophes, and hyphens anywhere
  STRICT_HEBREW_NAME: /^[\u05D0-\u05EA]+(?:[\s'-][\u05D0-\u05EA]+)*'?$/, // Strict Hebrew name: only Hebrew letters, optional spaces, hyphens, or apostrophes between words
} as const satisfies IRegex;
