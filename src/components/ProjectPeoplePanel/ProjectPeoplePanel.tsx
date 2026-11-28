import Tabs from "../Tabs/Tabs";
import { useState, type ReactNode } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { TAB_MODES } from "../../constants/tabs.constant";
import { MOBILE_LAYOUT_QUERY } from "../../constants/layout.constant";

interface IProjectPeoplePanelProps {
  team: ReactNode;
  contacts: ReactNode;
}
const ProjectPeoplePanel = ({ team, contacts }: IProjectPeoplePanelProps) => {
  const mobile = useMediaQuery(MOBILE_LAYOUT_QUERY);
  const [active, setActive] = useState("team");
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", minWidth: 0 }}>
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
          display: "grid",
          gridTemplateColumns: mobile ? "1fr" : "minmax(0,1fr) minmax(0,1fr)",
          gap: "16px",
          alignItems: "start",
        }}
      >
        <Box
          hidden={mobile && active !== "team"}
          sx={{ minWidth: 0, "&[hidden]": { display: "none" } }}
        >
          {team}
        </Box>
        <Box
          hidden={mobile && active !== "contacts"}
          sx={{ minWidth: 0, "&[hidden]": { display: "none" } }}
        >
          {contacts}
        </Box>
      </Box>
    </Box>
  );
};
export default ProjectPeoplePanel;
