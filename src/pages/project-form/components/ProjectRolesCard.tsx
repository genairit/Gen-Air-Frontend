import {
  getOptionLabels,
  findOptionIdByLabel,
  findOptionLabelById,
} from "../../../utilities/option.utility";

import {
  PROJECT_MEMBER_ROLES,
  type ProjectMemberRoleType,
} from "../../../constants/user-role.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { CHIP_SIZES } from "../../../constants/chip.constant";
import type { IApiUser } from "../../../interfaces/api.interface";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { formatRolesBadge } from "../../../utilities/text.utility";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import PersonSummary from "../../../components/PersonSummary/PersonSummary";
import type { TRoleAssignees } from "../../../interfaces/project.interface";
import { PROJECT_FORM_COPY } from "../../../constants/project-form.constant";
import { SURFACE_DEPTHS, SURFACE_RADII } from "../../../constants/surface.constant";
import { toRolePerson, toUserOptions } from "../../../utilities/mappers/user.mapper";

interface IProjectRolesCardProps {
  users: IApiUser[];
  assignees: TRoleAssignees;
  onAssigneeChange: (role: ProjectMemberRoleType, userId: string | null) => void;
}

const ProjectRolesCard: FC<IProjectRolesCardProps> = ({ users, assignees, onAssigneeChange }) => {
  const styles = usePageStyles();

  return (
    <Card gap="22px" padding="28px">
      <CardHeader
        icon={ICON_NAMES.CONTACTS}
        title={PROJECT_FORM_COPY.ROLES_TITLE}
        subtitle={PROJECT_FORM_COPY.ROLES_SUBTITLE}
        action={
          <Chip size={CHIP_SIZES.MEDIUM} label={formatRolesBadge(PROJECT_MEMBER_ROLES.length)} />
        }
      />
      <Box sx={styles.grid({ minColumnWidth: 220, gap: "20px" })}>
        {PROJECT_MEMBER_ROLES.map(role => {
          const roleOptions = toUserOptions(users.filter(user => user.role === role));

          return (
            <Card
              key={role}
              gap="12px"
              padding="18px"
              radius={SURFACE_RADII.PANEL}
              depth={SURFACE_DEPTHS.RAISED_SOFT}
            >
              <PersonSummary nameSize={15} person={toRolePerson(role)} />
              <Box component="span" sx={styles.caption}>
                {PROJECT_FORM_COPY.ASSIGNEE_LABEL}
              </Box>
              <Autocomplete
                isAutocomplete={false}
                options={getOptionLabels(roleOptions)}
                placeholder={PROJECT_FORM_COPY.NO_ASSIGNEE}
                value={findOptionLabelById(roleOptions, assignees[role])}
                onChange={label => onAssigneeChange(role, findOptionIdByLabel(roleOptions, label))}
              />
            </Card>
          );
        })}
      </Box>
    </Card>
  );
};

export default ProjectRolesCard;
