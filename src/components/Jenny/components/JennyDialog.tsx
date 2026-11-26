import JennyPanel from "./JennyPanel";
import JennySheet from "./JennySheet";
import Button from "../../Button/Button";
import { useStyles } from "../Jenny.style";
import type { FC, ReactNode, RefObject } from "react";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { JENNY_COPY } from "../../../constants/jenny.constant";
import type { useJennyDialog } from "../../../hooks/jenny-dialog.hook";
import { BUTTON_SIZES, BUTTON_SHAPES } from "../../Button/constants/button.constants";

interface IJennyDialogProps {
  children: ReactNode;
  inputRef: RefObject<HTMLElement | null>;
  dialog: ReturnType<typeof useJennyDialog>;
}

const JennyDialog: FC<IJennyDialogProps> = ({ dialog, inputRef, children }) => {
  const styles = useStyles();
  const { isMobile, panelId, titleId, isOpen, launcherRef, controlledPanelId, close, toggle } =
    dialog;
  const Surface = isMobile ? JennySheet : JennyPanel;

  return (
    <>
      <Button
        onClick={toggle}
        sx={styles.launcher}
        ariaExpanded={isOpen}
        icon={ICON_NAMES.AIR}
        buttonRef={launcherRef}
        size={BUTTON_SIZES.LARGE}
        shape={BUTTON_SHAPES.CIRCLE}
        ariaControls={controlledPanelId}
        ariaLabel={JENNY_COPY.LAUNCHER_LABEL}
      />
      <Surface
        isOpen={isOpen}
        onClose={close}
        panelId={panelId}
        titleId={titleId}
        inputRef={inputRef}
      >
        {children}
      </Surface>
    </>
  );
};

export default JennyDialog;
