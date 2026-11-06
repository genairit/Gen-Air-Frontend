import { type FC } from "react";
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
      <mark>{textMatch.match}</mark>
      {textMatch.after}
    </>
  );
};

export default MatchedText;
