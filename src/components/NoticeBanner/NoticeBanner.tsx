import { Box } from "@mui/material";
import type { FC, ReactNode } from "react";
import { useStyles } from "./NoticeBanner.style";
import SmartbaseNoticeCard from "../../vendor/smartbase/components/NoticeCard/NoticeCard";

interface INoticeBannerProps {
  title: string;
  lines: string[];
  actions?: ReactNode;
}

const NoticeBanner: FC<INoticeBannerProps> = ({ title, lines, actions }) => {
  const styles = useStyles();

  return (
    <Box role="status">
      <SmartbaseNoticeCard
        text={
          <Box sx={styles.content}>
            <Box sx={styles.text}>
              <b>{title}</b>
              {lines.map(line => (
                <span key={line}>{line}</span>
              ))}
            </Box>
            {actions && <Box sx={styles.actions}>{actions}</Box>}
          </Box>
        }
      />
    </Box>
  );
};

export default NoticeBanner;
