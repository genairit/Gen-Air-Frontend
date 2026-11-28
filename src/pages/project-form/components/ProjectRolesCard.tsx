import {
  getOptionLabels,
  findOptionIdByLabel,
  findOptionLabelById,
} from "../../../utilities/option.utility";

import {
  USER_ROLES,
  USER_ROLE_LABELS,
  PROJECT_MEMBER_ROLES,
  type ProjectMemberRoleType,
} from "../../../constants/user-role.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import type { IApiUser } from "../../../interfaces/api.interface";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { toUserOptions } from "../../../utilities/mappers/user.mapper";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import type { TRoleAssignees } from "../../../interfaces/project.interface";
import { PROJECT_FORM_COPY } from "../../../constants/project-form.constant";
import { getUsersAssignedToRole } from "../../../utilities/user-role.utility";

interface IProjectRolesCardProps {
  users: IApiUser[];
  isBuilding: boolean;
  assignees: TRoleAssignees;
  onAssigneeChange: (role: ProjectMemberRoleType, userId: string | null) => void;
}

const ProjectRolesCard: FC<IProjectRolesCardProps> = ({
  users,
  assignees,
  onAssigneeChange,
  isBuilding,
}) => {
  const styles = usePageStyles();
  const availableRoles = PROJECT_MEMBER_ROLES.filter(
    role => !isBuilding || role !== USER_ROLES.ENGINEER,
  );

  return (
    <Box sx={styles.stack({ gap: "12px" })}>
      <CardHeader title={PROJECT_FORM_COPY.ROLES_TITLE} />
      <Box sx={styles.grid({ minColumnWidth: 220, gap: "20px" })}>
        {availableRoles.map(role => {
          const roleOptions = toUserOptions(getUsersAssignedToRole(users, role));

          return (
            <Autocomplete
              key={role}
              isAutocomplete={false}
              title={USER_ROLE_LABELS[role]}
              options={getOptionLabels(roleOptions)}
              placeholder={PROJECT_FORM_COPY.NO_ASSIGNEE}
              value={findOptionLabelById(roleOptions, assignees[role])}
              onChange={label => onAssigneeChange(role, findOptionIdByLabel(roleOptions, label))}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default ProjectRolesCard;
