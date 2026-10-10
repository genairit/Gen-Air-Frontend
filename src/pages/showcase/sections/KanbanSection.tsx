import { useState } from "react";
import { Box } from "@mui/material";
import Card from "../../../components/Card/Card";
import ShowcaseSection from "../ShowcaseSection";
import { useShowcaseStyles } from "../showcase.style";
import Button from "../../../components/Button/Button";
import { noop } from "../../../utilities/function.utility";
import TextField from "../../../components/TextField/TextField";
import ProjectCard from "../../../components/ProjectCard/ProjectCard";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import KanbanColumn from "../../../components/KanbanColumn/KanbanColumn";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import { DEMO_BOARD_COLUMNS, DEMO_PROJECTS_BY_STAGE } from "../../../constants/demo-data.constant";
import { STAGE_FILTER_OPTIONS, MANAGER_FILTER_OPTIONS } from "../../../constants/showcase.constant";

const KanbanSection = () => {
  const styles = useShowcaseStyles();
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<string | null>(STAGE_FILTER_OPTIONS[0]);
  const [manager, setManager] = useState<string | null>(MANAGER_FILTER_OPTIONS[0]);

  return (
    <ShowcaseSection position={6} title="לוח בקרה — קנבן">
      <Card padding="20px" sx={styles.row({ gap: "14px" })}>
        <Box sx={styles.flexItem({ basis: "2 1 260px" })}>
          <TextField
            value={search}
            onChange={setSearch}
            type={FIELD_TYPES.SEARCH}
            placeholder="חיפוש פרויקטים, מזהה או קבלן..."
          />
        </Box>
        <Box sx={styles.flexItem({ basis: "1 1 160px" })}>
          <Autocomplete
            value={manager}
            onChange={setManager}
            isAutocomplete={false}
            options={MANAGER_FILTER_OPTIONS}
          />
        </Box>
        <Box sx={styles.flexItem({ basis: "1 1 140px" })}>
          <Autocomplete
            value={stage}
            onChange={setStage}
            isAutocomplete={false}
            options={STAGE_FILTER_OPTIONS}
          />
        </Box>
        <Button onClick={noop} text="+ פרויקט חדש" />
      </Card>

      <Box sx={styles.grid({ minColumnWidth: 280 })}>
        {DEMO_BOARD_COLUMNS.map(column => (
          <KanbanColumn
            key={column.stageId}
            title={column.title}
            dotColor={column.dotColor}
            count={DEMO_PROJECTS_BY_STAGE[column.stageId].length}
          >
            {DEMO_PROJECTS_BY_STAGE[column.stageId].map(project => (
              <ProjectCard onOpen={noop} key={project.id} project={project} />
            ))}
          </KanbanColumn>
        ))}
      </Box>
    </ShowcaseSection>
  );
};

export default KanbanSection;
