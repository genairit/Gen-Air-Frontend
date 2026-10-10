import { Box } from "@mui/material";
import type { FC, ReactNode } from "react";
import { useStyles } from "./TopBar.style";
import UserMenuButton from "./UserMenuButton";
import type { IPerson } from "../../interfaces/person.interface";

interface ITopBarProps {
  title: string;
  user: IPerson;
  leading?: ReactNode;
  onUserMenuClick: () => void;
}

const TopBar: FC<ITopBarProps> = ({ title, user, leading, onUserMenuClick }) => {
  const styles = useStyles();
  const titleElement = (
    <Box component="b" sx={styles.title}>
      {title}
    </Box>
  );

  return (
    <Box sx={styles.bar} component="header">
      {leading ?? titleElement}
      <UserMenuButton user={user} onClick={onUserMenuClick} />
    </Box>
  );
};

export default TopBar;
