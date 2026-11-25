import JennyMark from "./JennyMark";
import { useStyles } from "../Jenny.style";
import { Close, AddRounded } from "@mui/icons-material";
import { Box, Tooltip, IconButton } from "@mui/material";
import type { FC, ReactNode, MouseEventHandler } from "react";
import { JENNY_COPY } from "../../../constants/jenny.constant";

interface IHeaderActionProps {
  label: string;
  disabled?: boolean;
  children: ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

interface IJennyHeaderProps {
  titleId: string;
  onClose: () => void;
  hasMessages: boolean;
  contextLabel: string;
  isFullScreen: boolean;
  onNewChat: () => void;
  canStartNewChat: boolean;
}

const HeaderAction: FC<IHeaderActionProps> = ({ label, onClick, children, disabled = false }) => {
  const styles = useStyles();

  return (
    <Tooltip title={label}>
      <Box component="span">
        <IconButton
          size="small"
          onClick={onClick}
          aria-label={label}
          disabled={disabled}
          sx={styles.headerAction}
        >
          {children}
        </IconButton>
      </Box>
    </Tooltip>
  );
};

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
      <JennyMark size={32} iconSize={18} />
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
          <HeaderAction onClick={onNewChat} label={JENNY_COPY.NEW_CHAT} disabled={!canStartNewChat}>
            <AddRounded />
          </HeaderAction>
        )}
        <HeaderAction onClick={onClose} label={JENNY_COPY.CLOSE}>
          <Close />
        </HeaderAction>
      </Box>
    </Box>
  );
};

export default JennyHeader;
