import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./Avatar.style";
import { AVATAR_TONES, type AvatarToneType } from "../../constants/tone.constant";

interface IAvatarProps {
  size?: number;
  initials: string;
  hasRing?: boolean;
  tone?: AvatarToneType;
}

const Avatar: FC<IAvatarProps> = ({
  initials,
  size = 44,
  hasRing = false,
  tone = AVATAR_TONES.AIR,
}) => {
  const styles = useStyles();

  return <Box sx={styles.avatar({ size, tone, hasRing })}>{initials}</Box>;
};

export default Avatar;
