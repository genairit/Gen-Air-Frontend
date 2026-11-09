import {
  BUTTON_SHAPES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import { Box } from "@mui/material";
import Chip from "../../../components/Chip/Chip";
import Icon from "../../../components/Icon/Icon";
import Button from "../../../components/Button/Button";
import { theme } from "../../../constants/theme.constants";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { EMPLOYEE_COLUMN_STYLES } from "./employee-columns.style";
import { toTelephoneHref } from "../../../utilities/phone.utility";
import type { IEmployee } from "../../../interfaces/employee.interface";
import { USER_ROLE_LABELS } from "../../../constants/user-role.constant";
import PersonSummary from "../../../components/PersonSummary/PersonSummary";
import type { IDataTableColumn } from "../../../interfaces/data-table.interface";
import { EMPLOYEES_COPY, EMPLOYEE_TABLE_HEADERS } from "../../../constants/employee.constant";

interface IEmployeeColumnHandlers {
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (employee: IEmployee) => void;
  onDelete: (employee: IEmployee) => void;
}

export const EMPLOYEE_TABLE_MIN_WIDTH = 1160;

export const createEmployeeColumns = ({
  onDelete,
  onEdit,
  canDelete,
  canEdit,
}: IEmployeeColumnHandlers): IDataTableColumn<IEmployee>[] => {
  const canManageActions = canEdit || canDelete;

  return [
    {
      id: "person",
      track: "minmax(240px, 2fr)",
      header: EMPLOYEE_TABLE_HEADERS.PERSON,
      render: employee => <PersonSummary nameSize={15} avatarSize={46} person={employee.person} />,
    },
    {
      id: "email",
      track: "minmax(190px, 1.4fr)",
      header: EMPLOYEE_TABLE_HEADERS.EMAIL,
      render: employee => (
        <Box dir="ltr" component="span" sx={EMPLOYEE_COLUMN_STYLES.email}>
          {employee.email}
        </Box>
      ),
    },
    {
      id: "phone",
      track: "minmax(130px, 1fr)",
      header: EMPLOYEE_TABLE_HEADERS.PHONE,
      render: employee => (
        <Box
          dir="ltr"
          component="a"
          sx={EMPLOYEE_COLUMN_STYLES.phone}
          href={toTelephoneHref(employee.phone)}
        >
          <Icon size={20} name={ICON_NAMES.PHONE} />
          {employee.phone}
        </Box>
      ),
    },
    {
      id: "assignedRoles",
      track: "minmax(220px, 1.4fr)",
      header: EMPLOYEE_TABLE_HEADERS.ASSIGNED_ROLES,
      render: employee => (
        <Box sx={EMPLOYEE_COLUMN_STYLES.assignedRoles}>
          {employee.assignedRoles.map(role => (
            <Chip key={role} label={USER_ROLE_LABELS[role]} />
          ))}
        </Box>
      ),
    },
    {
      id: "activeRole",
      track: "minmax(150px, 1fr)",
      header: EMPLOYEE_TABLE_HEADERS.ACTIVE_ROLE,
      render: employee => (
        <Chip dotColor={theme.palette.primary} label={USER_ROLE_LABELS[employee.role]} />
      ),
    },
    {
      id: "actions",
      track: "106px",
      header: EMPLOYEE_TABLE_HEADERS.ACTIONS,
      render: employee =>
        canManageActions && (
          <Box sx={EMPLOYEE_COLUMN_STYLES.actions}>
            {canEdit && (
              <Button
                icon={ICON_NAMES.EDIT}
                shape={BUTTON_SHAPES.CIRCLE}
                ariaLabel={EMPLOYEES_COPY.EDIT}
                onClick={() => onEdit(employee)}
                variant={BUTTON_VARIANTS.NEUTRAL}
              />
            )}
            {canDelete && (
              <Button
                icon={ICON_NAMES.DELETE}
                shape={BUTTON_SHAPES.CIRCLE}
                ariaLabel={EMPLOYEES_COPY.DELETE}
                variant={BUTTON_VARIANTS.NEUTRAL}
                onClick={() => onDelete(employee)}
              />
            )}
          </Box>
        ),
    },
  ];
};
