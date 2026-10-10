import type { FC } from "react";
import Icon from "../Icon/Icon";
import { Box, ButtonBase } from "@mui/material";
import { useStyles } from "./SidebarAction.style";
import { useStyles as useSidebarStyles } from "./Sidebar.style";
import type { IconNameType } from "../../constants/icon.constant";

interface ISidebarActionProps {
  label: string;
  icon: IconNameType;
  onClick: () => void;
}

const SidebarAction: FC<ISidebarActionProps> = ({ label, icon, onClick }) => {
  const styles = useStyles();
  const sidebarStyles = useSidebarStyles();

  return (
    <ButtonBase onClick={onClick} sx={[sidebarStyles.pill, styles.action]}>
      <Box sx={styles.iconCircle}>
        <Icon size={22} name={icon} />
      </Box>
      {label}
    </ButtonBase>
  );
};

export default SidebarAction;
