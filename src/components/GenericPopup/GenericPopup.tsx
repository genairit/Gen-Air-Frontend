import {
  Box,
  Dialog,
  Divider,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import Button from "../Button/Button";
import { Close } from "@mui/icons-material";
import { useStyles } from "./GenericPopup.style";
import type { SxProps, Theme } from "@mui/material";
import { mergeSx } from "../../utilities/sx.utility";
import UltraSignature from "../UltraSignature/UltraSignature";
import type { TPopUpIcons } from "./constants/icons.constants";
import { renderPopupIcon } from "./utilities/renderIcon.utility";
import { BUTTON_VARIANTS } from "../Button/constants/button.constants";
import { type FC, type MouseEvent, type ReactNode, useState } from "react";

export type TAlignContent = "left" | "center" | "right";

export interface IPopupButton {
  text: string;
  isDisabled?: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

export interface IGenericPopupProps {
  open: boolean;
  title: string;
  header?: ReactNode;
  sx?: SxProps<Theme>;
  guidelines?: string;
  signature?: boolean;
  content?: ReactNode;
  onClose?: () => void;
  align?: TAlignContent;
  closeAfterAction?: boolean;
  maxWidth?: "sm" | "md" | "lg";
  icon?: TPopUpIcons | ReactNode;
  buttons: {
    primary: IPopupButton;
    secondary?: Partial<IPopupButton>;
  };
}

const GenericPopup: FC<IGenericPopupProps> = ({
  open,
  sx,
  icon,
  title,
  onClose,
  buttons,
  content,
  header,
  signature,
  guidelines,
  align = "left",
  maxWidth = "sm",
  closeAfterAction = true,
}) => {
  const styles = useStyles({ align });

  const [isSigned, setIsSigned] = useState(false);
  const [primaryButtonLoading, setPrimaryButtonLoading] = useState(false);
  const [secondaryButtonLoading, setSecondaryButtonLoading] = useState(false);

  const needToSign = Boolean(signature) && !isSigned;

  const handlePrimaryButtonClick = async (event: MouseEvent<HTMLButtonElement>) => {
    try {
      setPrimaryButtonLoading(true);
      await buttons.primary.onClick(event);
    } finally {
      setPrimaryButtonLoading(false);
      if (closeAfterAction) {
        onClose?.();
      }
    }
  };

  const handleSecondaryButtonClick = async (event: MouseEvent<HTMLButtonElement>) => {
    try {
      setSecondaryButtonLoading(true);
      await buttons?.secondary?.onClick?.(event);
    } finally {
      setSecondaryButtonLoading(false);
      if (closeAfterAction) {
        onClose?.();
      }
    }
  };

  const popupHeader = header ?? (
    <>
      <Box sx={styles.headerContainer}>
        <DialogTitle sx={styles.title}>{title ?? ""}</DialogTitle>
        <IconButton size="small" onClick={onClose}>
          <Close />
        </IconButton>
      </Box>
      <Divider />
    </>
  );

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      sx={mergeSx(styles.root, sx ?? null)}
    >
      {popupHeader}
      <DialogContent sx={styles.contentContainer}>
        {icon && <Box sx={styles.iconContainer}>{renderPopupIcon(icon) ?? null}</Box>}

        {content && <Box sx={styles.content}>{content}</Box>}

        {signature && <UltraSignature isSigned={isSigned} setIsSigned={setIsSigned} />}

        {guidelines && <Typography sx={styles.guidelines}>{guidelines}</Typography>}
      </DialogContent>
      <DialogActions sx={styles.actions}>
        {buttons.secondary && (
          <Button
            sx={styles.button}
            variant={BUTTON_VARIANTS.NEUTRAL}
            isLoading={secondaryButtonLoading}
            onClick={handleSecondaryButtonClick}
            disabled={buttons.secondary?.isDisabled}
            text={buttons.secondary?.text ?? "ביטול"}
          />
        )}
        <Button
          sx={styles.button}
          text={buttons.primary.text}
          isLoading={primaryButtonLoading}
          variant={BUTTON_VARIANTS.PRIMARY}
          onClick={handlePrimaryButtonClick}
          disabled={buttons.primary.isDisabled || needToSign}
        />
      </DialogActions>
    </Dialog>
  );
};

export default GenericPopup;
