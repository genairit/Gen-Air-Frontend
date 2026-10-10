import { Box } from "@mui/material";
import Avatar from "../Avatar/Avatar";
import type { FC, ReactNode } from "react";
import { useStyles } from "./PersonSummary.style";
import type { IPerson } from "../../interfaces/person.interface";
import { SURFACE_TONES, type SurfaceToneType } from "../../constants/tone.constant";

interface IPersonSummaryProps {
  person: IPerson;
  nameSize?: number;
  avatarSize?: number;
  nameAdornment?: ReactNode;
  surface?: SurfaceToneType;
}

const PersonSummary: FC<IPersonSummaryProps> = ({
  person,
  nameAdornment,
  nameSize = 14,
  avatarSize = 44,
  surface = SURFACE_TONES.LIGHT,
}) => {
  const styles = useStyles();

  return (
    <Box sx={styles.container}>
      <Avatar size={avatarSize} tone={person.avatarTone} initials={person.initials} />
      <Box sx={styles.text}>
        <Box component="b" sx={styles.name({ surface, nameSize })}>
          {person.name}
          {nameAdornment}
        </Box>
        <Box component="span" sx={styles.caption({ surface })}>
          {person.caption}
        </Box>
      </Box>
    </Box>
  );
};

export default PersonSummary;
