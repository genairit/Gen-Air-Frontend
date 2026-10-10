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
import { toTelephoneHref } from "../../../utilities/employee.utility";
import type { IEmployee } from "../../../interfaces/employee.interface";
import { USER_ROLE_LABELS } from "../../../constants/user-role.constant";
import PersonSummary from "../../../components/PersonSummary/PersonSummary";
import type { IDataTableColumn } from "../../../interfaces/data-table.interface";
import { EMPLOYEES_COPY, EMPLOYEE_TABLE_HEADERS } from "../../../constants/employee.constant";

interface IEmployeeColumnHandlers {
  canManage: boolean;
  onDelete: (employee: IEmployee) => void;
}

export const EMPLOYEE_TABLE_MIN_WIDTH = 880;

export const createEmployeeColumns = ({
  onDelete,
  canManage,
}: IEmployeeColumnHandlers): IDataTableColumn<IEmployee>[] => [
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
    id: "role",
    track: "minmax(140px, 1fr)",
    header: EMPLOYEE_TABLE_HEADERS.ROLE,
    render: employee => (
      <Chip dotColor={theme.palette.charcoal} label={USER_ROLE_LABELS[employee.role]} />
    ),
  },
  {
    id: "actions",
    track: "64px",
    header: EMPLOYEE_TABLE_HEADERS.ACTIONS,
    render: employee =>
      canManage && (
        <Box sx={EMPLOYEE_COLUMN_STYLES.actions}>
          <Button
            icon={ICON_NAMES.DELETE}
            shape={BUTTON_SHAPES.CIRCLE}
            ariaLabel={EMPLOYEES_COPY.DELETE}
            variant={BUTTON_VARIANTS.NEUTRAL}
            onClick={() => onDelete(employee)}
          />
        </Box>
      ),
  },
];
