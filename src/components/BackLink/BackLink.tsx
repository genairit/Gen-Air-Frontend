import type { FC } from "react";
import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import { useStyles } from "./BackLink.style";

interface IBackLinkProps {
  to: string;
  label: string;
  state?: unknown;
}

const BackLink: FC<IBackLinkProps> = ({ to, label, state }) => {
  const styles = useStyles();

  return (
    <Box to={to} state={state} component={Link} sx={styles.link}>
      {`→ ${label}`}
    </Box>
  );
};

export default BackLink;
