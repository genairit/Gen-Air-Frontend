import { Box } from "@mui/material";
import type { FC, ReactNode } from "react";
import { useStyles } from "./ShowcaseSection.style";
import { toTwoDigitOrdinal } from "../../utilities/number.utility";

interface IShowcaseSectionProps {
  title: string;
  position: number;
  children: ReactNode;
}

const ShowcaseSection: FC<IShowcaseSectionProps> = ({ title, position, children }) => {
  const styles = useStyles();

  return (
    <Box component="section" sx={styles.section}>
      <Box sx={styles.heading}>
        <Box component="span" sx={styles.index}>
          {toTwoDigitOrdinal(position)}
        </Box>
        <Box component="h2" sx={styles.title}>
          {title}
        </Box>
      </Box>
      {children}
    </Box>
  );
};

export default ShowcaseSection;
