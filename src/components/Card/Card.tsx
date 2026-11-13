import {
  SURFACE_RADII,
  SURFACE_DEPTHS,
  type SurfaceDepthType,
  type SurfaceRadiusType,
} from "../../constants/surface.constant";

import { useStyles } from "./Card.style";
import { mergeSx } from "../../utilities/sx.utility";
import type { FC, MouseEvent, ReactNode } from "react";
import { ButtonBase, type SxProps, type Theme } from "@mui/material";
import SmartbaseCard from "../../vendor/smartbase/components/Card/Card";

interface ICardProps {
  gap?: string;
  padding?: string;
  ariaLabel?: string;
  sx?: SxProps<Theme>;
  children?: ReactNode;
  onClick?: () => void;
  ariaPressed?: boolean;
  depth?: SurfaceDepthType;
  radius?: SurfaceRadiusType;
}

const Card: FC<ICardProps> = ({
  sx,
  onClick,
  children,
  ariaLabel,
  ariaPressed,
  gap = "12px",
  padding = "16px",
  depth = SURFACE_DEPTHS.RAISED,
  radius = SURFACE_RADII.CARD,
}) => {
  const styles = useStyles();
  const isClickable = onClick != null;
  const handleActionClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClick?.();
  };
  const handleCardClick = (event: MouseEvent<HTMLElement>) => {
    const interactiveDescendant =
      event.target instanceof Element &&
      event.target.closest(
        "a, button, input, select, textarea, [role='button'], [role='combobox'], [role='switch'], [role='checkbox'], [role='tab']",
      ) !== null;

    if (interactiveDescendant) {
      return;
    }

    onClick?.();
  };
  const cardClickProps = isClickable ? { onClick: handleCardClick } : {};
  return (
    <SmartbaseCard
      ariaLabel={ariaLabel}
      sx={mergeSx(styles.card({ depth, radius, padding, gap, isClickable }), sx ?? null)}
      {...cardClickProps}
    >
      {isClickable && (
        <ButtonBase
          type="button"
          aria-label={ariaLabel}
          sx={styles.actionButton}
          aria-pressed={ariaPressed}
          onClick={handleActionClick}
        />
      )}
      {children}
    </SmartbaseCard>
  );
};

export default Card;
