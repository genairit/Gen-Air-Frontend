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
              <Box component="b">{title}</Box>
              {lines.map(line => (
                <Box component="span" key={line}>
                  {line}
                </Box>
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
