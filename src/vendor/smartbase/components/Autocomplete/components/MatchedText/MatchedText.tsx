import { type FC } from "react";
import { Box } from "@mui/material";
import { splitByMatch } from "../../../../utilities/text-match.utility";
import { type IMatchedTextProps } from "../../../../interfaces/autocomplete.interface";

const MatchedText: FC<IMatchedTextProps> = ({ text, query, isHighlighted }) => {
  const textMatch = splitByMatch(text, query);

  if (!isHighlighted || !textMatch) {
    return <>{text}</>;
  }

  return (
    <>
      {textMatch.before}
      <Box component="mark">{textMatch.match}</Box>
      {textMatch.after}
    </>
  );
};

export default MatchedText;
