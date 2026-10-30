import { Box } from "@mui/material";
import { type FC, useState } from "react";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import Button from "../../../components/Button/Button";
import ApartmentTeamPicker from "./ApartmentTeamPicker";
import ApartmentTeamMembers from "./ApartmentTeamMembers";
import { ICON_NAMES } from "../../../constants/icon.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import InlineError from "../../../components/InlineError/InlineError";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { toApartmentAssignments } from "../../../utilities/apartment.utility";
import type { IApiProject, IApiProjectMember } from "../../../interfaces/api.interface";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { useUpdateApartmentMutation } from "../../../hooks/mutations/apartment.mutation";
import CustomerContactPreview from "../../../components/CustomerContacts/CustomerContactPreview";
import { APARTMENT_PAGE_COPY, APARTMENT_TEAM_COPY } from "../../../constants/apartment.constant";

interface IApartmentContactCardProps {
  canEdit: boolean;
  apartment: IApiProject;
}
const ApartmentContactCard: FC<IApartmentContactCardProps> = ({ apartment, canEdit }) => {
  const styles = usePageStyles();
  const [draft, setDraft] = useState<IApiProjectMember[] | null>(null);
  const updateMutation = useUpdateApartmentMutation();
  const isEditing = draft !== null;
  const isOwn = apartment.hasOwnTeam === true || isEditing;
  const members = draft ?? apartment.members ?? [];
  const badge = isOwn ? APARTMENT_TEAM_COPY.OWN : APARTMENT_TEAM_COPY.INHERITED;
  const teamChangeProps = isEditing ? { onChange: setDraft } : {};
  const saveTeam = () =>
    updateMutation.mutate(
      {
        apartmentId: apartment.id,
        changes: { hasOwnTeam: true, members: toApartmentAssignments(members) },
      },
      { onSuccess: () => setDraft(null) },
    );
  const resetTeam = () =>
    updateMutation.mutate(
      { apartmentId: apartment.id, changes: { hasOwnTeam: false } },
      { onSuccess: () => setDraft(null) },
    );
  return (
    <Card gap="18px">
      <CardHeader
        icon={ICON_NAMES.CONTACTS}
        title={APARTMENT_PAGE_COPY.CONTACT_TITLE}
        subtitle={APARTMENT_PAGE_COPY.CONTACT_SUBTITLE}
      />
      {apartment.customerId && (
        <CustomerContactPreview key={apartment.customerId} customerId={apartment.customerId} />
      )}
      <Box sx={styles.spacedRow}>
        <Box sx={styles.row({})}>
          <b>{APARTMENT_TEAM_COPY.TITLE}</b>
          <Chip label={badge} />
        </Box>
        {canEdit && (
          <Box sx={styles.row({ gap: "10px" })}>
            {!isEditing && (
              <Button
                variant={BUTTON_VARIANTS.NEUTRAL}
                disabled={updateMutation.isPending}
                text={APARTMENT_TEAM_COPY.OVERRIDE}
                onClick={() => setDraft([...members])}
              />
            )}
            {isOwn && (
              <Button
                onClick={resetTeam}
                text={APARTMENT_TEAM_COPY.RESET}
                variant={BUTTON_VARIANTS.NEUTRAL}
                isLoading={updateMutation.isPending}
              />
            )}
          </Box>
        )}
      </Box>
      <ApartmentTeamMembers
        isOwn={isOwn}
        members={members}
        disabled={updateMutation.isPending}
        {...teamChangeProps}
      />
      {isEditing && (
        <>
          <ApartmentTeamPicker
            members={members}
            onChange={setDraft}
            disabled={updateMutation.isPending}
          />
          <Box sx={styles.row({})}>
            <Button
              onClick={saveTeam}
              text={APARTMENT_TEAM_COPY.SAVE}
              isLoading={updateMutation.isPending}
            />
            <Button
              onClick={() => setDraft(null)}
              text={APARTMENT_PAGE_COPY.CANCEL}
              variant={BUTTON_VARIANTS.NEUTRAL}
              disabled={updateMutation.isPending}
            />
          </Box>
        </>
      )}
      {updateMutation.isError && <InlineError message={getApiErrorMessage(updateMutation.error)} />}
    </Card>
  );
};
export default ApartmentContactCard;
