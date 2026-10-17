import Card from "../Card/Card";
import Icon from "../Icon/Icon";
import type { FC, ReactNode } from "react";
import { Box, ButtonBase } from "@mui/material";
import { useStyles } from "./FolderAccordion.style";
import type { IconNameType } from "../../constants/icon.constant";
import { SURFACE_DEPTHS, SURFACE_RADII } from "../../constants/surface.constant";

interface IFolderAccordionProps {
  title: string;
  caption: string;
  badge?: ReactNode;
  isExpanded: boolean;
  children: ReactNode;
  icon?: IconNameType;
  onToggle: () => void;
}

const FolderAccordion: FC<IFolderAccordionProps> = ({
  icon,
  badge,
  title,
  caption,
  isExpanded,
  children,
  onToggle,
}) => {
  const styles = useStyles();
  const chevron = isExpanded ? "−" : "+";
  const depth = isExpanded ? SURFACE_DEPTHS.INSET : SURFACE_DEPTHS.RAISED_SOFT;

  return (
    <Card gap="0" padding="0" depth={depth} sx={styles.card} radius={SURFACE_RADII.PANEL}>
      <ButtonBase onClick={onToggle} sx={styles.header} aria-expanded={isExpanded}>
        {icon && <Icon size={26} name={icon} />}
        <Box component="span" sx={styles.title}>
          {title}
        </Box>
        <Box component="span" sx={styles.meta}>
          {caption}
          {badge}
          <Box component="span" sx={styles.chevron}>
            {chevron}
          </Box>
        </Box>
      </ButtonBase>
      {isExpanded && <Box sx={styles.content}>{children}</Box>}
    </Card>
  );
};

export default FolderAccordion;
