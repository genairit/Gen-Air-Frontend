import { Box } from "@mui/material";
import type { FC, ReactNode } from "react";
import { useStyles } from "./TopBar.style";
import UserMenuButton from "./UserMenuButton";
import type { IPerson } from "../../interfaces/person.interface";
import type { UserRoleType } from "../../constants/user-role.constant";

interface ITopBarProps {
  title: string;
  user: IPerson;
  leading?: ReactNode;
  titleAction?: ReactNode;
  activeRole: UserRoleType;
  assignedRoles: UserRoleType[];
  onRoleChange: (role: UserRoleType) => Promise<void>;
}

const TopBar: FC<ITopBarProps> = ({
  title,
  user,
  leading,
  titleAction,
  activeRole,
  assignedRoles,
  onRoleChange,
}) => {
  const styles = useStyles();
  const titleElement = titleAction ? (
    <Box sx={styles.titleGroup}>
      <Box component="h1" sx={styles.title}>
        {title}
      </Box>
      {titleAction}
    </Box>
  ) : (
    <Box component="b" sx={styles.title}>
      {title}
    </Box>
  );

  return (
    <Box sx={styles.bar} component="header">
      {leading ?? titleElement}
      <UserMenuButton
        user={user}
        activeRole={activeRole}
        onRoleChange={onRoleChange}
        assignedRoles={assignedRoles}
      />
    </Box>
  );
};

export default TopBar;
