import type {
  IMarkdownSpan,
  TMarkdownLine,
  IMarkdownBlock,
} from "../../../interfaces/markdown.interface";

import { Box } from "@mui/material";
import type { FC, ElementType } from "react";
import { useThreadStyles } from "../JennyThread.style";
import { MARKDOWN_BLOCK_KINDS } from "../../../constants/markdown.constant";
import { parseRestrictedMarkdown } from "../../../utilities/markdown.utility";
import type { MarkdownBlockKindType } from "../../../constants/markdown.constant";

interface IMarkdownProps {
  markdown: string;
}

interface IMarkdownBlockProps {
  block: IMarkdownBlock;
}

const MarkdownSpan: FC<{ span: IMarkdownSpan }> = ({ span }) => {
  if (!span.isBold) {
    return span.text;
  }

  return <Box component="strong">{span.text}</Box>;
};

const MarkdownLine: FC<{ line: TMarkdownLine }> = ({ line }) =>
  line.map((span, index) => <MarkdownSpan key={index} span={span} />);

const MarkdownParagraph: FC<IMarkdownBlockProps> = ({ block }) => {
  const styles = useThreadStyles();

  return (
    <Box dir="auto" component="p">
      {block.lines.map((line, index) => (
        <Box key={index} component="span" sx={styles.markdownLine}>
          <MarkdownLine line={line} />
        </Box>
      ))}
    </Box>
  );
};

const createMarkdownList =
  (listElement: ElementType): FC<IMarkdownBlockProps> =>
  ({ block }) => (
    <Box component={listElement}>
      {block.lines.map((line, index) => (
        <Box dir="auto" key={index} component="li">
          <MarkdownLine line={line} />
        </Box>
      ))}
    </Box>
  );

const BLOCK_RENDERERS: Record<MarkdownBlockKindType, FC<IMarkdownBlockProps>> = {
  [MARKDOWN_BLOCK_KINDS.PARAGRAPH]: MarkdownParagraph,
  [MARKDOWN_BLOCK_KINDS.ORDERED_LIST]: createMarkdownList("ol"),
  [MARKDOWN_BLOCK_KINDS.UNORDERED_LIST]: createMarkdownList("ul"),
};

const MarkdownBlock: FC<IMarkdownBlockProps> = ({ block }) => {
  const BlockRenderer = BLOCK_RENDERERS[block.kind];

  return <BlockRenderer block={block} />;
};

const JennyMarkdown: FC<IMarkdownProps> = ({ markdown }) => {
  const styles = useThreadStyles();
  const blocks = parseRestrictedMarkdown(markdown);

  return (
    <Box sx={styles.markdown}>
      {blocks.map((block, index) => (
        <MarkdownBlock key={index} block={block} />
      ))}
    </Box>
  );
};

export default JennyMarkdown;
