import type { MarkdownBlockKindType } from "../constants/markdown.constant";

export interface IMarkdownSpan {
  text: string;
  isBold: boolean;
}

export type TMarkdownLine = IMarkdownSpan[];

export interface IMarkdownBlock {
  lines: TMarkdownLine[];
  kind: MarkdownBlockKindType;
}

export interface IRestrictedMarkdownProps {
  markdown: string;
}

export interface IMarkdownBlockProps {
  block: IMarkdownBlock;
}

export interface IMarkdownLineProps {
  line: TMarkdownLine;
}

export interface IMarkdownSpanProps {
  span: IMarkdownSpan;
}
