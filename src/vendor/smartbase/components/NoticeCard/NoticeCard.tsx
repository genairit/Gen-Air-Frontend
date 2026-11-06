import {
  NOTICE_SIZES,
  NOTICE_VARIANTS,
  type TNoticeSize,
  STYLE_BY_VARIANT,
  type TNoticeVariant,
} from "./constants/notice-card.constant";

import type { FC, ReactNode } from "react";
import { useStyles } from "./NoticeCard.style";
import { Box, Typography } from "@mui/material";
import { getNoticePalette } from "./utilities/notice-palette.utility";

export interface INoticeCardProps {
  icon?: ReactNode;
  size?: TNoticeSize;
  variant?: TNoticeVariant;
  text: string | ReactNode;
}

const NoticeCard: FC<INoticeCardProps> = ({
  icon,
  text,
  size = NOTICE_SIZES.regular,
  variant = NOTICE_VARIANTS.info,
}) => {
  const variantStyle = STYLE_BY_VARIANT[variant];
  const { tone, DefaultIcon } = variantStyle;

  const palette = getNoticePalette(variantStyle);
  const styles = useStyles({ size, palette });

  const renderedDefaultIcon = DefaultIcon ? (
    <DefaultIcon htmlColor={tone} fontSize="inherit" />
  ) : null;
  const displayedIcon = icon ?? renderedDefaultIcon;

  return (
    <div style={styles.noticeCard}>
      <Typography component="div" sx={styles.textContent}>
        {text}
      </Typography>

      {displayedIcon && (
        <Box component="span" sx={styles.icon}>
          {displayedIcon}
        </Box>
      )}
    </div>
  );
};

export default NoticeCard;
