import type { FC, ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import Card from "../../../components/Card/Card";
import { usePageStyles } from "../../page.style";
import IconTile from "../../../components/IconTile/IconTile";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { ESTIMATE_TYPOGRAPHY } from "../../../styles/engineering-estimate-typography.style";

interface IEstimateSectionProps {
  title: string;
  children: ReactNode;
}

const EstimateSection: FC<IEstimateSectionProps> = ({ title, children }) => {
  const styles = usePageStyles();

  return (
    <Card gap="18px" padding="24px">
      <Box sx={styles.row({ gap: "12px" })}>
        <IconTile name={ICON_NAMES.DOCUMENT} />
        <Typography component="h2" sx={ESTIMATE_TYPOGRAPHY.section}>
          {title}
        </Typography>
      </Box>
      {children}
    </Card>
  );
};

export default EstimateSection;
