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
  activeRole: UserRoleType;
  titleComponent?: "h1" | "b";
  assignedRoles: UserRoleType[];
  onRoleChange: (role: UserRoleType) => Promise<void>;
}

const TopBar: FC<ITopBarProps> = ({
  title,
  user,
  leading,
  titleComponent = "b",
  activeRole,
  assignedRoles,
  onRoleChange,
}) => {
  const styles = useStyles();
  const titleElement = (
    <Box sx={styles.title} component={titleComponent}>
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
