import { VALIDATION_MESSAGE_PATTERNS } from "../constants/validation-message.constant";
import type { IValidationMessageSegment } from "../interfaces/validation-message.interface";

export const segmentValidationMessage = (text: string): IValidationMessageSegment[] => {
  const matches = [...text.matchAll(VALIDATION_MESSAGE_PATTERNS.TECHNICAL)];
  const segments = matches.flatMap((match, index) => {
    const previous = matches[index - 1];
    const start = previous ? previous.index + previous[0].length : 0;
    const prefix = text.slice(start, match.index);
    const technical = { text: match[0], start: match.index, technical: true };
    if (!prefix) {
      return [technical];
    }

    return [{ text: prefix, start, technical: false }, technical];
  });
  const last = matches.at(-1);
  const start = last ? last.index + last[0].length : 0;
  const suffix = text.slice(start);
  if (!suffix) {
    return segments;
  }

  return [...segments, { text: suffix, start, technical: false }];
};
