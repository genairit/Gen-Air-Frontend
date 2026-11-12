import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { USER_ROLES } from "../../../constants/user-role.constant";
import { APARTMENT_TEAM_COPY } from "../../../constants/apartment.constant";
import ApartmentTeamPicker from "../../apartment/components/ApartmentTeamPicker";
import ApartmentTeamMembers from "../../apartment/components/ApartmentTeamMembers";
import type { IApiProject, IApiProjectMember } from "../../../interfaces/api.interface";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import ApartmentEngineerPicker from "../../apartment/components/ApartmentEngineerPicker";

interface IApartmentTeamDraftCardProps {
  building: IApiProject;
  engineerUserId: string | null;
  members: IApiProjectMember[] | null;
  onEngineerChange: (userId: string | null) => void;
  onChange: (members: IApiProjectMember[] | null) => void;
}
const ApartmentTeamDraftCard: FC<IApartmentTeamDraftCardProps> = ({
  building,
  members,
  engineerUserId,
  onEngineerChange,
  onChange,
}) => {
  const styles = usePageStyles();
  const isOwn = members !== null;
  const effectiveMembers = (members ?? building.members ?? []).filter(
    member => member.role !== USER_ROLES.ENGINEER,
  );
  const badge = isOwn ? APARTMENT_TEAM_COPY.OWN : APARTMENT_TEAM_COPY.INHERITED;
  const toggleLabel = isOwn ? APARTMENT_TEAM_COPY.RESET : APARTMENT_TEAM_COPY.OVERRIDE;
  const toggleTeam = () => onChange(isOwn ? null : [...effectiveMembers]);
  return (
    <Card gap="18px" padding="24px">
      <CardHeader
        icon={ICON_NAMES.CONTACTS}
        title={APARTMENT_TEAM_COPY.TITLE}
        subtitle={APARTMENT_TEAM_COPY.DESCRIPTION}
      />
      <ApartmentEngineerPicker value={engineerUserId} onChange={onEngineerChange} />
      <Box sx={styles.spacedRow}>
        <Box sx={styles.row({})}>
          <Box component="b">{APARTMENT_TEAM_COPY.OTHER_TEAM}</Box>
          <Chip label={badge} />
        </Box>
        <Button text={toggleLabel} onClick={toggleTeam} variant={BUTTON_VARIANTS.NEUTRAL} />
      </Box>
      <ApartmentTeamMembers isOwn={isOwn} onChange={onChange} members={effectiveMembers} />
      {isOwn && <ApartmentTeamPicker onChange={onChange} members={effectiveMembers} />}
    </Card>
  );
};
export default ApartmentTeamDraftCard;
