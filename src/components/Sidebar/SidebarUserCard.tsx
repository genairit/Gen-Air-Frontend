import type { FC } from "react";
import { Box, ButtonBase } from "@mui/material";
import { useStyles } from "./SidebarUserCard.style";
import PersonSummary from "../PersonSummary/PersonSummary";
import { SURFACE_TONES } from "../../constants/tone.constant";
import type { IPerson } from "../../interfaces/person.interface";

interface ISidebarUserCardProps {
  user: IPerson;
  actionLabel: string;
  onAction: () => void;
}

const SidebarUserCard: FC<ISidebarUserCardProps> = ({ user, actionLabel, onAction }) => {
  const styles = useStyles();

  return (
    <Box sx={styles.card}>
      <PersonSummary person={user} surface={SURFACE_TONES.DARK} />
      <ButtonBase onClick={onAction} sx={styles.action}>
        {actionLabel}
      </ButtonBase>
    </Box>
  );
};

export default SidebarUserCard;
