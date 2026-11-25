import { useStyles } from "./IconActionButton.style";
import { Box, Tooltip, IconButton } from "@mui/material";
import { useState, type FC, type ReactNode } from "react";
import { KEY_TYPES, KEYBOARD_EVENTS } from "../../constants/keyboard.constant";
import { isKeyboardEvent, createKeyHandler } from "../../utilities/keyboard.utility";
import { useEventListener } from "../../vendor/smartbase/hooks/use-event-listener.hook";

interface IIconActionButtonProps {
  label: string;
  disabled?: boolean;
  children: ReactNode;
  onClick: () => void;
}

const IconActionButton: FC<IIconActionButtonProps> = ({
  label,
  onClick,
  children,
  disabled = false,
}) => {
  const styles = useStyles();
  const [anchor, setAnchor] = useState<HTMLSpanElement | null>(null);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const openTooltip = () => setIsTooltipOpen(true);
  const closeTooltip = () => setIsTooltipOpen(false);
  const closeTooltipOnEscape = createKeyHandler({ [KEY_TYPES.ESCAPE]: closeTooltip });

  const handleDocumentKeyDown = (event: Event) => {
    if (!isKeyboardEvent(event)) {
      return;
    }

    closeTooltipOnEscape(event);
  };

  // Capturing on the document lets an open tooltip consume Escape before an enclosing panel closes.
  useEventListener({
    capture: true,
    isEnabled: isTooltipOpen,
    type: KEYBOARD_EVENTS.KEY_DOWN,
    listener: handleDocumentKeyDown,
    target: anchor?.ownerDocument ?? null,
  });

  return (
    <Tooltip title={label} open={isTooltipOpen} onOpen={openTooltip} onClose={closeTooltip}>
      <Box ref={setAnchor} component="span">
        <IconButton
          size="small"
          onClick={onClick}
          aria-label={label}
          sx={styles.action}
          disabled={disabled}
        >
          {children}
        </IconButton>
      </Box>
    </Tooltip>
  );
};

export default IconActionButton;
