import {
  BUTTON_SIZES,
  BUTTON_SHAPES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { toPerson } from "../../../utilities/mappers/user.mapper";
import { useStyles as useTeamStyles } from "./ApartmentTeam.style";
import type { IApiProjectMember } from "../../../interfaces/api.interface";
import PersonSummary from "../../../components/PersonSummary/PersonSummary";
import { APARTMENT_TEAM_COPY } from "../../../constants/apartment.constant";
import { SURFACE_DEPTHS, SURFACE_RADII } from "../../../constants/surface.constant";

interface IApartmentTeamMembersProps {
  isOwn: boolean;
  disabled?: boolean;
  members: IApiProjectMember[];
  onChange?: (members: IApiProjectMember[]) => void;
}

const ApartmentTeamMembers: FC<IApartmentTeamMembersProps> = ({
  members,
  isOwn,
  disabled = false,
  onChange,
}) => {
  const styles = usePageStyles();
  const teamStyles = useTeamStyles();
  const canRemove = isOwn && Boolean(onChange);
  const emptyText = isOwn ? APARTMENT_TEAM_COPY.EMPTY : APARTMENT_TEAM_COPY.EMPTY_PARENT;
  return (
    <>
      {members.length === 0 && (
        <Box component="span" sx={styles.caption}>
          {emptyText}
        </Box>
      )}
      <Box sx={styles.grid({ minColumnWidth: 220, gap: "12px" })}>
        {members.map(
          member =>
            member.user && (
              <Card
                key={member.userId}
                padding="10px 14px"
                sx={teamStyles.memberRow}
                radius={SURFACE_RADII.PANEL}
                depth={SURFACE_DEPTHS.RAISED_SOFT}
              >
                <PersonSummary nameSize={14} avatarSize={36} person={toPerson(member.user)} />
                {canRemove && (
                  <Button
                    disabled={disabled}
                    icon={ICON_NAMES.DELETE}
                    size={BUTTON_SIZES.COMPACT}
                    shape={BUTTON_SHAPES.CIRCLE}
                    variant={BUTTON_VARIANTS.NEUTRAL}
                    ariaLabel={`${APARTMENT_TEAM_COPY.REMOVE} ${member.user.firstName} ${member.user.lastName}`}
                    onClick={() =>
                      onChange?.(members.filter(current => current.userId !== member.userId))
                    }
                  />
                )}
              </Card>
            ),
        )}
      </Box>
    </>
  );
};
export default ApartmentTeamMembers;
