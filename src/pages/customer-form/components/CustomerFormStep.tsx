import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import { useRef, type FC, type ReactNode } from "react";
import type { IconNameType } from "../../../constants/icon.constant";
import GenericPopup from "../../../components/GenericPopup/GenericPopup";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

interface ICustomerFormStepProps {
  busy: boolean;
  title: string;
  popup: boolean;
  saveText: string;
  cancelText: string;
  onSave: () => void;
  children: ReactNode;
  onCancel: () => void;
  saveIcon?: IconNameType;
}

const CustomerFormStep: FC<ICustomerFormStepProps> = ({
  busy,
  popup,
  title,
  saveText,
  cancelText,
  saveIcon,
  children,
  onSave,
  onCancel,
}) => {
  const styles = usePageStyles();
  const titleRef = useRef<HTMLElement>(null);
  if (popup) {
    return (
      <GenericPopup
        open
        dir="rtl"
        align="start"
        maxWidth="md"
        title={title}
        onClose={onCancel}
        content={children}
        titleRef={titleRef}
        closeDisabled={busy}
        closeAfterAction={false}
        initialFocusRef={titleRef}
        buttons={{
          primary: { text: saveText, onClick: onSave, isDisabled: busy },
          secondary: { text: cancelText, onClick: onCancel, isDisabled: busy },
        }}
      />
    );
  }
  return (
    <Box sx={styles.page}>
      {children}
      <Box sx={styles.endRow}>
        <Button
          disabled={busy}
          text={cancelText}
          onClick={onCancel}
          variant={BUTTON_VARIANTS.NEUTRAL}
        />
        <Button text={saveText} icon={saveIcon} onClick={onSave} isLoading={busy} />
      </Box>
    </Box>
  );
};

export default CustomerFormStep;
