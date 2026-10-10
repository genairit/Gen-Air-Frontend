import type { FC } from "react";
import { Box, ButtonBase } from "@mui/material";
import { useStyles } from "./UserMenuButton.style";
import PersonSummary from "../PersonSummary/PersonSummary";
import type { IPerson } from "../../interfaces/person.interface";

interface IUserMenuButtonProps {
  user: IPerson;
  onClick: () => void;
}

const UserMenuButton: FC<IUserMenuButtonProps> = ({ user, onClick }) => {
  const styles = useStyles();

  return (
    <ButtonBase onClick={onClick} sx={styles.button} aria-haspopup="menu">
      <PersonSummary person={user} avatarSize={40} />
      <Box component="span" sx={styles.chevron}>
        ▾
      </Box>
    </ButtonBase>
  );
};

export default UserMenuButton;
