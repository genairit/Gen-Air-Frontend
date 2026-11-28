import Tabs from "../Tabs/Tabs";
import { useState, type ReactNode } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { TAB_MODES } from "../../constants/tabs.constant";
import { usePeopleStyles } from "./ProjectPeoplePanel.style";
import { MOBILE_LAYOUT_QUERY } from "../../constants/layout.constant";

interface IProjectPeoplePanelProps {
  team: ReactNode;
  contacts: ReactNode;
}
const ProjectPeoplePanel = ({ team, contacts }: IProjectPeoplePanelProps) => {
  const styles = usePeopleStyles();
  const mobile = useMediaQuery(MOBILE_LAYOUT_QUERY);
  const [active, setActive] = useState("team");
  return (
    <Box sx={styles.root}>
      {mobile && (
        <Tabs
          activeId={active}
          onChange={setActive}
          mode={TAB_MODES.FILTER}
          ariaLabel="צוות ואנשי קשר"
          items={[
            { id: "team", label: "צוות" },
            { id: "contacts", label: "אנשי קשר" },
          ]}
        />
      )}
      <Box
        sx={{
          ...styles.columns,
          gridTemplateColumns: mobile ? "1fr" : "minmax(0,1fr) minmax(0,1fr)",
        }}
      >
        <Box sx={styles.column} hidden={mobile && active !== "team"}>
          {team}
        </Box>
        <Box sx={styles.column} hidden={mobile && active !== "contacts"}>
          {contacts}
        </Box>
      </Box>
    </Box>
  );
};
export default ProjectPeoplePanel;
