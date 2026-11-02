import { Box } from "@mui/material";
import { useStyles } from "./Card.style";
import CardHeader from "./components/CardHeader";
import type { SxProps, Theme } from "@mui/material";
import { mergeSx } from "../../../../utilities/sx.utility";
import { useState, type FC, type MouseEvent, type ReactNode } from "react";

export interface ICardProps {
  title?: string;
  subtitle?: string;
  ariaLabel?: string;
  action?: ReactNode;
  sx?: SxProps<Theme>;
  children: ReactNode;
  onRemove?: () => void;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}

const Card: FC<ICardProps> = ({
  title,
  subtitle,
  sx,
  action,
  children,
  onRemove,
  onClick,
  ariaLabel,
}) => {
  const styles = useStyles();

  const [isRemoved, setIsRemoved] = useState<boolean>(false);

  if (isRemoved) {
    return null;
  }

  const removeCard = (): void => {
    setIsRemoved(true);
    onRemove?.();
  };

  const handleRemove = onRemove ? removeCard : null;

  return (
    <Box
      onClick={onClick}
      component="section"
      aria-label={ariaLabel}
      sx={mergeSx(styles.card, sx ?? null)}
    >
      <CardHeader title={title} action={action} subtitle={subtitle} onRemove={handleRemove} />
      {children}
    </Box>
  );
};

export default Card;
