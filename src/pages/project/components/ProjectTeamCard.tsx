import {
  PROJECT_PAGE_COPY,
  PROJECT_PAGE_STATUS_COPY,
} from "../../../constants/project-page.constant";

import {
  BUTTON_SIZES,
  BUTTON_SHAPES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import type { FC } from "react";
import { Box } from "@mui/material";
import Dot from "../../../components/Dot/Dot";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import { theme } from "../../../constants/theme.constants";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { formatTeamBadge } from "../../../utilities/text.utility";
import { toPerson } from "../../../utilities/mappers/user.mapper";
import CardHeader from "../../../components/CardHeader/CardHeader";
import PersonCard from "../../../components/PersonCard/PersonCard";
import { callPhoneNumber } from "../../../utilities/employee.utility";
import type { IApiProjectMember } from "../../../interfaces/api.interface";

interface IProjectTeamCardProps {
  members: IApiProjectMember[];
}

const ProjectTeamCard: FC<IProjectTeamCardProps> = ({ members }) => {
  const styles = usePageStyles();
  const membersWithUsers = members.flatMap(member => (member.user ? [member.user] : []));

  return (
    <Card gap="20px">
      <CardHeader
        icon={ICON_NAMES.CONTACTS}
        title={PROJECT_PAGE_COPY.TEAM_TITLE}
        subtitle={PROJECT_PAGE_COPY.TEAM_SUBTITLE}
        badge={formatTeamBadge(membersWithUsers.length)}
        action={
          <Box component="span" sx={styles.statusCaption}>
            <Dot size={8} color={theme.palette.statusBlue} />
            {PROJECT_PAGE_COPY.TEAM_STATUS}
          </Box>
        }
      />
      {membersWithUsers.length === 0 && (
        <Box component="span" sx={styles.caption}>
          {PROJECT_PAGE_STATUS_COPY.NO_MEMBERS}
        </Box>
      )}
      <Box sx={styles.grid({ minColumnWidth: 200, gap: "18px" })}>
        {membersWithUsers.map(user => (
          <PersonCard
            key={user.id}
            person={toPerson(user)}
            action={
              <Button
                icon={ICON_NAMES.PHONE}
                shape={BUTTON_SHAPES.CIRCLE}
                size={BUTTON_SIZES.COMPACT}
                variant={BUTTON_VARIANTS.PRESSED}
                onClick={() => callPhoneNumber(user.phone)}
                ariaLabel={PROJECT_PAGE_COPY.CALL_MEMBER}
              />
            }
          />
        ))}
      </Box>
    </Card>
  );
};

export default ProjectTeamCard;
