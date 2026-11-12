import { Box } from "@mui/material";
import type { FC, ReactNode } from "react";
import { useStyles } from "./DetailTile.style";

interface IDetailTileProps {
  label: string;
  value: string;
  isLtr?: boolean;
  badge?: ReactNode;
  href?: string | null;
  note?: string | null;
  isFullWidth?: boolean;
}

const DetailTile: FC<IDetailTileProps> = ({
  note,
  href,
  label,
  value,
  badge,
  isLtr = false,
  isFullWidth = false,
}) => {
  const styles = useStyles();
  const valueComponent = href ? "a" : "span";

  return (
    <Box sx={styles.tile(isFullWidth)}>
      <Box component="span" sx={styles.label}>
        {label}
      </Box>
      <Box sx={styles.valueRow}>
        <Box {...(href ? { href } : {})} sx={styles.value} component={valueComponent}>
          <Box component="bdi" dir={isLtr ? "ltr" : "rtl"}>
            {value}
          </Box>
        </Box>
        {badge}
      </Box>
      {note && (
        <Box component="span" sx={styles.note}>
          {note}
        </Box>
      )}
    </Box>
  );
};

export default DetailTile;
