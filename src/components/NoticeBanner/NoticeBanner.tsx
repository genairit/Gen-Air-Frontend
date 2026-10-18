import Icon from "../Icon/Icon";
import { Box } from "@mui/material";
import type { FC, ReactNode } from "react";
import { useStyles } from "./NoticeBanner.style";
import { ICON_NAMES } from "../../constants/icon.constant";

interface INoticeBannerProps {
  title: string;
  lines: string[];
  actions?: ReactNode;
}

const NoticeBanner: FC<INoticeBannerProps> = ({ title, lines, actions }) => {
  const styles = useStyles();

  return (
    <Box role="status" sx={styles.banner}>
      <Box sx={styles.content}>
        <Icon name={ICON_NAMES.INFO} />
        <Box sx={styles.text}>
          <b>{title}</b>
          {lines.map(line => (
            <span key={line}>{line}</span>
          ))}
        </Box>
      </Box>
      {actions && <Box sx={styles.actions}>{actions}</Box>}
    </Box>
  );
};

export default NoticeBanner;
