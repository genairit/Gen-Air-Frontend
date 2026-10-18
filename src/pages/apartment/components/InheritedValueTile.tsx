import { Box } from "@mui/material";
import type { FC, ReactNode } from "react";
import Chip from "../../../components/Chip/Chip";
import { useStyles } from "./InheritedValueTile.style";
import { INHERITANCE_BADGES } from "../../../constants/apartment.constant";
import type { TInheritanceSourceType } from "../../../interfaces/apartment.interface";

interface IInheritedValueTileProps {
  label: string;
  value: string;
  notes: string[];
  badge?: ReactNode;
  children?: ReactNode;
  source: TInheritanceSourceType;
}

const InheritedValueTile: FC<IInheritedValueTileProps> = ({
  label,
  value,
  notes,
  badge,
  source,
  children,
}) => {
  const styles = useStyles();
  const sourceBadge = INHERITANCE_BADGES[source];

  return (
    <Box sx={styles.tile}>
      <Box sx={styles.header}>
        <Box component="span" sx={styles.label}>
          {label}
        </Box>
        <Chip label={sourceBadge.label} variant={sourceBadge.variant} />
      </Box>
      <Box sx={styles.valueRow}>
        <Box component="b" sx={styles.value}>
          {value}
        </Box>
        {badge}
      </Box>
      {notes.map(note => (
        <Box key={note} component="span" sx={styles.note}>
          {note}
        </Box>
      ))}
      {children}
    </Box>
  );
};

export default InheritedValueTile;
