import {
  USER_ROLE_LABELS,
  type UserRoleType,
  ASSIGNABLE_USER_ROLE_VALUES,
} from "../../constants/user-role.constant";

import { useState } from "react";
import type { FC, MouseEvent } from "react";
import { Check } from "@mui/icons-material";
import { useStyles } from "./UserMenuButton.style";
import InlineError from "../InlineError/InlineError";
import { logger } from "../../utilities/logger.utility";
import PersonSummary from "../PersonSummary/PersonSummary";
import { Box, ButtonBase, Menu, MenuItem } from "@mui/material";
import type { IPerson } from "../../interfaces/person.interface";
import { getApiErrorMessage } from "../../utilities/api-error.utility";

interface IUserMenuButtonProps {
  user: IPerson;
  activeRole: UserRoleType;
  assignedRoles: UserRoleType[];
  onRoleChange: (role: UserRoleType) => Promise<void>;
}

const UserMenuButton: FC<IUserMenuButtonProps> = ({
  user,
  activeRole,
  assignedRoles,
  onRoleChange,
}) => {
  const styles = useStyles();
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const assignableRoles = assignedRoles.filter(role => ASSIGNABLE_USER_ROLE_VALUES.includes(role));
  const canSwitchRole =
    assignableRoles.length > 1 ||
    (assignableRoles.length > 0 && !assignableRoles.includes(activeRole));
  const isMenuOpen = anchorElement !== null;

  const isTriggerDisabled = !canSwitchRole;
  const popupType = canSwitchRole ? "menu" : false;
  const roleOptions = assignableRoles.map(role => ({
    role,
    isChecked: activeRole === role,
    label: USER_ROLE_LABELS[role],
  }));

  const openMenu = (event: MouseEvent<HTMLButtonElement>): void => {
    if (!canSwitchRole) {
      return;
    }

    setErrorMessage(null);
    setAnchorElement(event.currentTarget);
  };

  const closeMenu = (): void => setAnchorElement(null);

  const selectRole = async (role: UserRoleType): Promise<void> => {
    if (role === activeRole) {
      closeMenu();
      return;
    }

    setIsPending(true);
    setErrorMessage(null);

    try {
      await onRoleChange(role);
      closeMenu();
    } catch (error) {
      logger.error("Failed to switch the active role", { error });
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <ButtonBase
        sx={styles.button}
        onClick={openMenu}
        aria-haspopup={popupType}
        aria-expanded={isMenuOpen}
        disabled={isTriggerDisabled}
      >
        <PersonSummary person={user} avatarSize={40} />
        {canSwitchRole && (
          <Box component="span" sx={styles.chevron}>
            ▾
          </Box>
        )}
      </ButtonBase>
      {canSwitchRole && (
        <Menu
          open={isMenuOpen}
          onClose={closeMenu}
          anchorEl={anchorElement}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          {roleOptions.map(({ role, label, isChecked }) => (
            <MenuItem
              key={role}
              role="menuitemradio"
              sx={styles.menuItem}
              disabled={isPending}
              aria-checked={isChecked}
              onClick={() => selectRole(role)}
            >
              <Box sx={styles.roleLabel}>{label}</Box>
              {isChecked && <Check sx={styles.selectedCheck} />}
            </MenuItem>
          ))}
          {errorMessage && (
            <Box sx={styles.error}>
              <InlineError message={errorMessage} />
            </Box>
          )}
        </Menu>
      )}
    </>
  );
};

export default UserMenuButton;
