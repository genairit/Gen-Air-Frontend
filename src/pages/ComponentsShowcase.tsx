import { Box } from "@mui/material";
import { useStyles } from "./ComponentsShowcase.style";
import ShowcaseHeader from "./showcase/ShowcaseHeader";
import TableSection from "./showcase/sections/TableSection";
import KanbanSection from "./showcase/sections/KanbanSection";
import InputsSection from "./showcase/sections/InputsSection";
import ButtonsSection from "./showcase/sections/ButtonsSection";
import SettingsSection from "./showcase/sections/SettingsSection";
import NavigationSection from "./showcase/sections/NavigationSection";
import FoundationsSection from "./showcase/sections/FoundationsSection";
import ProjectViewSection from "./showcase/sections/ProjectViewSection";
import ProjectFormSection from "./showcase/sections/ProjectFormSection";
import LoginMobileSection from "./showcase/sections/LoginMobileSection";
import ChipsAndTabsSection from "./showcase/sections/ChipsAndTabsSection";
import ExistingComponentsSection from "./showcase/sections/ExistingComponentsSection";

const ComponentsShowcase = () => {
  const styles = useStyles();

  return (
    <Box sx={styles.page}>
      <ShowcaseHeader />
      <FoundationsSection />
      <ButtonsSection />
      <InputsSection />
      <ChipsAndTabsSection />
      <NavigationSection />
      <KanbanSection />
      <ProjectViewSection />
      <ProjectFormSection />
      <SettingsSection />
      <TableSection />
      <LoginMobileSection />
      <ExistingComponentsSection />
    </Box>
  );
};

export default ComponentsShowcase;
