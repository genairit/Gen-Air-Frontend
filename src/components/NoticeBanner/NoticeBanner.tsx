import {
  NOTICE_VARIANTS,
  type TNoticeVariant,
} from "../../vendor/smartbase/components/NoticeCard/constants/notice-card.constant";

import { Box } from "@mui/material";
import { useStyles } from "./NoticeBanner.style";
import type { FC, ReactNode, RefObject } from "react";
import SmartbaseNoticeCard from "../../vendor/smartbase/components/NoticeCard/NoticeCard";

interface INoticeBannerProps {
  title: string;
  lines?: string[];
  actions?: ReactNode;
  variant?: TNoticeVariant;
  titleRef?: RefObject<HTMLElement | null>;
}

const NoticeBanner: FC<INoticeBannerProps> = ({
  title,
  lines = [],
  actions,
  titleRef,
  variant = NOTICE_VARIANTS.info,
}) => {
  const styles = useStyles();
  const isUrgent = variant === NOTICE_VARIANTS.error || variant === NOTICE_VARIANTS.warning;
  const noticeRole = isUrgent ? "alert" : "status";

  return (
    <Box role={noticeRole}>
      <SmartbaseNoticeCard
        variant={variant}
        text={
          <Box sx={styles.content}>
            <Box sx={styles.text}>
              <Box component="b" ref={titleRef} tabIndex={-1}>
                {title}
              </Box>
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
