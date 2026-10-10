import type { FC } from "react";
import Card from "../Card/Card";
import Chip from "../Chip/Chip";
import { Box } from "@mui/material";
import IconTile from "../IconTile/IconTile";
import { useStyles } from "./OptionCard.style";
import RadioIndicator from "../RadioButton/RadioIndicator";
import { CHIP_VARIANTS } from "../../constants/chip.constant";
import type { IconNameType } from "../../constants/icon.constant";
import { CONTROL_SIZES } from "../../constants/selection-control.constant";
import { SURFACE_DEPTHS, SURFACE_RADII } from "../../constants/surface.constant";

interface IOptionCardProps {
  tag: string;
  title: string;
  subtitle: string;
  isSelected: boolean;
  description: string;
  icon?: IconNameType;
  onSelect: () => void;
}

const OptionCard: FC<IOptionCardProps> = ({
  tag,
  icon,
  title,
  subtitle,
  isSelected,
  description,
  onSelect,
}) => {
  const styles = useStyles();

  return (
    <Card
      gap="10px"
      padding="20px"
      onClick={onSelect}
      radius={SURFACE_RADII.PANEL}
      sx={styles.card({ isSelected })}
    >
      <Box sx={styles.indicatorRow}>
        {icon && <IconTile name={icon} depth={SURFACE_DEPTHS.RAISED_SOFT} />}
        <RadioIndicator checked={isSelected} size={CONTROL_SIZES.SMALL} />
      </Box>
      <Box component="b" sx={styles.title}>
        {title}
      </Box>
      <Box component="span" sx={styles.subtitle}>
        {subtitle}
      </Box>
      <Box component="span" sx={styles.description}>
        {description}
      </Box>
      <Chip label={tag} sx={styles.tag} variant={CHIP_VARIANTS.INSET} />
    </Card>
  );
};

export default OptionCard;
