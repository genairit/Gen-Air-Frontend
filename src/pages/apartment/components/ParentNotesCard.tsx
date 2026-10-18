import type { FC } from "react";
import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import { useStyles } from "./ApartmentNotes.style";
import { ICON_NAMES } from "../../../constants/icon.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { hasTamaNote } from "../../../utilities/apartment.utility";
import { buildProjectPath } from "../../../utilities/route.utility";
import type { IApiProject } from "../../../interfaces/api.interface";
import { APARTMENT_PAGE_COPY, BUILDING_PAGE_COPY } from "../../../constants/apartment.constant";

interface IParentNotesCardProps {
  apartment: IApiProject;
}

const ParentNotesCard: FC<IParentNotesCardProps> = ({ apartment }) => {
  const styles = useStyles();
  const pageStyles = usePageStyles();
  const parentNotes = apartment.parentNotes ?? null;

  return (
    <Card gap="16px">
      <CardHeader
        icon={ICON_NAMES.INFO}
        title={APARTMENT_PAGE_COPY.PARENT_NOTES_TITLE}
        action={<Chip label={APARTMENT_PAGE_COPY.READ_ONLY} />}
      />
      <Box sx={pageStyles.row({ gap: "8px" })}>
        {hasTamaNote(parentNotes) && <Chip label={BUILDING_PAGE_COPY.TAMA_BADGE} />}
        <Box component="span" sx={pageStyles.caption}>
          {APARTMENT_PAGE_COPY.PASSES_TO_ALL}
        </Box>
      </Box>
      <Box sx={styles.notesBox}>{parentNotes ?? BUILDING_PAGE_COPY.NO_NOTES}</Box>
      <Box component={Link} sx={styles.link} to={buildProjectPath(apartment.parentProjectId ?? "")}>
        {APARTMENT_PAGE_COPY.OPEN_PARENT}
      </Box>
    </Card>
  );
};

export default ParentNotesCard;
