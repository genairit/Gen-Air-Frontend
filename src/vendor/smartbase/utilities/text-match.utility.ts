import { type ITextMatch } from "../interfaces/text-match.interface";

export const splitByMatch = (text: string, query: string): ITextMatch | null => {
  if (!text || !query) {
    return null;
  }

  const needle = query.trim();

  if (!needle) {
    return null;
  }

  const matchIndex = text.toLocaleLowerCase().indexOf(needle.toLocaleLowerCase());

  if (matchIndex < 0) {
    return null;
  }

  const matchEnd = matchIndex + needle.length;

  return {
    after: text.slice(matchEnd),
    before: text.slice(0, matchIndex),
    match: text.slice(matchIndex, matchEnd),
  };
};
