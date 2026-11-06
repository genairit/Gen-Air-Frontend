import type { FC, ReactNode } from "react";
import { Close } from "@mui/icons-material";
import { useStyles } from "./CardHeader.style";
import { Box, IconButton, Typography } from "@mui/material";
import { CARD_TEXTS } from "../../../constants/card.constant";

interface ICardHeaderProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  titleAccessory?: ReactNode;
  onRemove: (() => void) | null;
}

const CardHeader: FC<ICardHeaderProps> = ({
  title,
  subtitle,
  action,
  onRemove,
  titleAccessory,
}) => {
  const styles = useStyles();

  const hasTitles = Boolean(title || subtitle);
  const hasActions = Boolean(action || onRemove);

  if (!hasTitles && !hasActions) {
    return null;
  }

  return (
    <Box sx={styles.header}>
      {hasTitles && (
        <Box sx={styles.titles}>
          {title && (
            <Box sx={styles.titleRow}>
              <Typography sx={styles.title}>{title}</Typography>
              {titleAccessory}
            </Box>
          )}
          {subtitle && <Typography sx={styles.subtitle}>{subtitle}</Typography>}
        </Box>
      )}
      {hasActions && (
        <Box sx={styles.actions}>
          {action}
          {onRemove && (
            <IconButton
              onClick={onRemove}
              sx={styles.removeButton}
              title={CARD_TEXTS.REMOVE}
              aria-label={CARD_TEXTS.REMOVE}
            >
              <Close sx={styles.removeGlyph} />
            </IconButton>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CardHeader;
