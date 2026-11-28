import {
  PROJECT_PAGE_COPY,
  PROJECT_PAGE_STATUS_COPY,
} from "../../../constants/project-page.constant";

import {
  BUTTON_SIZES,
  BUTTON_SHAPES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import {
  usePeopleStyles,
  PEOPLE_ROW_STYLES,
} from "../../../components/ProjectPeoplePanel/ProjectPeoplePanel.style";

import { Box } from "@mui/material";
import { useState, type FC } from "react";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import { getInitials } from "../../../utilities/text.utility";
import { ICON_NAMES } from "../../../constants/icon.constant";
import Pagination from "../../../components/Pagination/Pagination";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { callPhoneNumber } from "../../../utilities/employee.utility";
import { USER_ROLE_LABELS } from "../../../constants/user-role.constant";
import type { IApiProjectMember } from "../../../interfaces/api.interface";

interface IProjectTeamCardProps {
  members: IApiProjectMember[];
}

const ProjectTeamCard: FC<IProjectTeamCardProps> = ({ members }) => {
  const styles = usePageStyles();
  const peopleStyles = usePeopleStyles();
  const [page, setPage] = useState(1);
  const membersWithUsers = members.filter(member => member.user);
  const pageCount = Math.max(1, Math.ceil(membersWithUsers.length / 5));
  const currentPage = Math.min(page, pageCount);

  return (
    <Card gap="8px" padding="8px">
      <CardHeader title={PROJECT_PAGE_COPY.TEAM_TITLE} />
      {membersWithUsers.length === 0 && (
        <Box component="span" sx={styles.caption}>
          {PROJECT_PAGE_STATUS_COPY.NO_MEMBERS}
        </Box>
      )}
      <Box sx={styles.stack({ gap: "4px" })}>
        {membersWithUsers.slice((currentPage - 1) * 5, currentPage * 5).map(
          member =>
            member.user && (
              <Box
                key={member.id ?? member.userId}
                sx={{ ...styles.spacedRow, ...PEOPLE_ROW_STYLES }}
              >
                <Box sx={peopleStyles.identity}>
                  <Box aria-hidden sx={peopleStyles.avatar}>
                    {getInitials(`${member.user.firstName} ${member.user.lastName}`)}
                  </Box>
                  <Box>
                    <Box component="b" sx={peopleStyles.name}>
                      {member.user.firstName} {member.user.lastName}
                    </Box>
                    <Box sx={styles.caption}>{USER_ROLE_LABELS[member.role]}</Box>
                  </Box>
                </Box>
                {member.user.phone && (
                  <Button
                    icon={ICON_NAMES.PHONE}
                    size={BUTTON_SIZES.COMPACT}
                    shape={BUTTON_SHAPES.CIRCLE}
                    variant={BUTTON_VARIANTS.NEUTRAL}
                    onClick={() => callPhoneNumber(member.user!.phone)}
                    ariaLabel={`${PROJECT_PAGE_COPY.CALL_MEMBER} ${member.user.firstName} ${member.user.lastName}`}
                  />
                )}
              </Box>
            ),
        )}
      </Box>
      {pageCount > 1 && (
        <Pagination
          compact
          page={currentPage}
          onChange={setPage}
          pageCount={pageCount}
          nextLabel="עובדים הבאים"
          previousLabel="עובדים קודמים"
        />
      )}
    </Card>
  );
};

export default ProjectTeamCard;
