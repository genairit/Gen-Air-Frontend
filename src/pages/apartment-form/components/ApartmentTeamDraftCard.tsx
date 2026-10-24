import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { APARTMENT_TEAM_COPY } from "../../../constants/apartment.constant";
import ApartmentTeamPicker from "../../apartment/components/ApartmentTeamPicker";
import ApartmentTeamMembers from "../../apartment/components/ApartmentTeamMembers";
import type { IApiProject, IApiProjectMember } from "../../../interfaces/api.interface";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

interface IApartmentTeamDraftCardProps {
  building: IApiProject;
  members: IApiProjectMember[] | null;
  onChange: (members: IApiProjectMember[] | null) => void;
}
const ApartmentTeamDraftCard: FC<IApartmentTeamDraftCardProps> = ({
  building,
  members,
  onChange,
}) => {
  const styles = usePageStyles();
  const isOwn = members !== null;
  const effectiveMembers = members ?? building.members ?? [];
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
      <Box sx={styles.spacedRow}>
        <Chip label={badge} />
        <Button text={toggleLabel} onClick={toggleTeam} variant={BUTTON_VARIANTS.NEUTRAL} />
      </Box>
      <ApartmentTeamMembers isOwn={isOwn} onChange={onChange} members={effectiveMembers} />
      {isOwn && <ApartmentTeamPicker onChange={onChange} members={effectiveMembers} />}
    </Card>
  );
};
export default ApartmentTeamDraftCard;
