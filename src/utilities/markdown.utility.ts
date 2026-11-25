import {
  MARKDOWN_PATTERNS,
  MARKDOWN_LIST_KINDS,
  MARKDOWN_BLOCK_KINDS,
  MARKDOWN_MARKER_BY_KIND,
  type MarkdownBlockKindType,
} from "../constants/markdown.constant";

import type { IMarkdownBlock, TMarkdownLine } from "../interfaces/markdown.interface";

const getLineKind = (line: string): MarkdownBlockKindType =>
  MARKDOWN_LIST_KINDS.find(kind => MARKDOWN_MARKER_BY_KIND[kind].test(line)) ??
  MARKDOWN_BLOCK_KINDS.PARAGRAPH;

const parseInlineSpans = (text: string): TMarkdownLine =>
  text
    .split(MARKDOWN_PATTERNS.BOLD_SEGMENT)
    .map((segment, index) => ({ text: segment, isBold: index % 2 === 1 }))
    .filter(span => span.text !== "");

const parseLine = (line: string, kind: MarkdownBlockKindType): TMarkdownLine =>
  parseInlineSpans(line.replace(MARKDOWN_MARKER_BY_KIND[kind], "").trimEnd());

const appendLine = (blocks: IMarkdownBlock[], line: string): IMarkdownBlock[] => {
  const kind = getLineKind(line);
  const previousBlock = blocks.at(-1);
  const parsedLine = parseLine(line, kind);

  if (previousBlock?.kind !== kind) {
    return [...blocks, { kind, lines: [parsedLine] }];
  }

  return [...blocks.slice(0, -1), { kind, lines: [...previousBlock.lines, parsedLine] }];
};

const isContentLine = (line: string) => line.trim() !== "";

const parseLineGroup = (group: string): IMarkdownBlock[] =>
  group.split(MARKDOWN_PATTERNS.LINE_BREAK).filter(isContentLine).reduce(appendLine, []);

export const parseRestrictedMarkdown = (markdown: string): IMarkdownBlock[] =>
  markdown.split(MARKDOWN_PATTERNS.BLANK_LINE).flatMap(parseLineGroup);

const toLineText = (line: TMarkdownLine) => line.map(span => span.text).join("");

export const toMarkdownPlainText = (markdown: string): string =>
  parseRestrictedMarkdown(markdown)
    .flatMap(block => block.lines)
    .map(toLineText)
    .join(" ");
