import type { FC } from "react";
import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import { useStyles } from "./BackLink.style";

interface IBackLinkProps {
  to: string;
  label: string;
}

const BackLink: FC<IBackLinkProps> = ({ to, label }) => {
  const styles = useStyles();

  return (
    <Box to={to} component={Link} sx={styles.link}>
      {`→ ${label}`}
    </Box>
  );
};

export default BackLink;
