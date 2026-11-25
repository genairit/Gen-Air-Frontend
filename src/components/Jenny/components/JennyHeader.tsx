import type { FC } from "react";
import Icon from "../../Icon/Icon";
import JennyMark from "./JennyMark";
import { Box } from "@mui/material";
import { useStyles } from "../Jenny.style";
import { Close } from "@mui/icons-material";
import IconActionButton from "../../IconActionButton/IconActionButton";
import { ICON_NAMES, ICON_COLORS } from "../../../constants/icon.constant";
import { JENNY_COPY, JENNY_MARK_PRESETS } from "../../../constants/jenny.constant";

interface IJennyHeaderProps {
  titleId: string;
  onClose: () => void;
  hasMessages: boolean;
  contextLabel: string;
  isFullScreen: boolean;
  onNewChat: () => void;
  canStartNewChat: boolean;
}

const JennyHeader: FC<IJennyHeaderProps> = ({
  titleId,
  onClose,
  onNewChat,
  hasMessages,
  contextLabel,
  isFullScreen,
  canStartNewChat,
}) => {
  const styles = useStyles();

  return (
    <Box sx={styles.header({ isFullScreen })}>
      <JennyMark preset={JENNY_MARK_PRESETS.HEADER} />
      <Box sx={styles.titleBlock}>
        <Box id={titleId} component="h2" sx={styles.title}>
          {JENNY_COPY.TITLE}
        </Box>
        <Box component="span" sx={styles.subtitle}>
          {JENNY_COPY.SUBTITLE_PREFIX}
          <Box component="bdi">{contextLabel}</Box>
        </Box>
      </Box>
      <Box sx={styles.headerActions}>
        {hasMessages && (
          <IconActionButton
            onClick={onNewChat}
            label={JENNY_COPY.NEW_CHAT}
            disabled={!canStartNewChat}
          >
            <Icon name={ICON_NAMES.ADD} color={ICON_COLORS.INHERIT} />
          </IconActionButton>
        )}
        <IconActionButton onClick={onClose} label={JENNY_COPY.CLOSE}>
          <Close />
        </IconActionButton>
      </Box>
    </Box>
  );
};

export default JennyHeader;
