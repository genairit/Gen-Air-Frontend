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
import DetailTile from "../../../components/DetailTile/DetailTile";
import InlineError from "../../../components/InlineError/InlineError";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { toApartmentAssignments } from "../../../utilities/apartment.utility";
import type { IApiProject, IApiProjectMember } from "../../../interfaces/api.interface";
import { formatCustomerDetailValue } from "../../../utilities/customer-details.utility";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { useUpdateApartmentMutation } from "../../../hooks/mutations/apartment.mutation";
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
  const phoneHref = apartment.contactPhone ? `tel:${apartment.contactPhone}` : null;
  const phoneLinkProps = phoneHref ? { href: phoneHref } : {};
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
      <Box sx={styles.grid({ minColumnWidth: 180, gap: "14px" })}>
        <DetailTile
          label={APARTMENT_PAGE_COPY.CONTACT_NAME}
          value={formatCustomerDetailValue(apartment.contactName)}
        />
        <DetailTile
          isLtr
          label={APARTMENT_PAGE_COPY.CONTACT_PHONE}
          value={formatCustomerDetailValue(apartment.contactPhone)}
          {...phoneLinkProps}
        />
      </Box>
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
