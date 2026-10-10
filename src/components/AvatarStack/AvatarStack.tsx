import type { FC } from "react";
import { Box } from "@mui/material";
import Avatar from "../Avatar/Avatar";
import { useStyles } from "./AvatarStack.style";

interface IAvatarStackProps {
  size?: number;
  initialsList: string[];
}

const AvatarStack: FC<IAvatarStackProps> = ({ initialsList, size = 32 }) => {
  const styles = useStyles();
  const lastIndex = initialsList.length - 1;

  return (
    <Box sx={styles.stack}>
      {initialsList.map((initials, index) => (
        <Box
          key={`${initials}-${index}`}
          sx={styles.slot({ avatarSize: size, isLast: index === lastIndex })}
        >
          <Avatar hasRing size={size} initials={initials} />
        </Box>
      ))}
    </Box>
  );
};

export default AvatarStack;
