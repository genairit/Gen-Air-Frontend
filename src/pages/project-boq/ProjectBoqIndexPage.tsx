import { useState } from "react";
import { usePageStyles } from "../page.style";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import Button from "../../components/Button/Button";
import DataTable from "../../components/DataTable/DataTable";
import TextField from "../../components/TextField/TextField";
import { ROUTE_PATHS } from "../../constants/routes.constant";
import type { IApiProject } from "../../interfaces/api.interface";
import InlineError from "../../components/InlineError/InlineError";
import LoadingState from "../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { useProjectPagesQuery } from "../../hooks/queries/project.query";
import type { IDataTableColumn } from "../../interfaces/data-table.interface";
import { FIELD_TYPES } from "../../components/TextField/constants/textfield.constants";

const columns: IDataTableColumn<IApiProject>[] = [
  { id: "code", track: "minmax(130px, 0.5fr)", header: "קוד", render: project => project.code },
  { id: "name", track: "minmax(230px, 1.4fr)", header: "פרויקט", render: project => project.name },
  {
    id: "customer",
    track: "minmax(170px, 1fr)",
    header: "לקוח",
    render: project => project.customer?.name ?? "—",
  },
  {
    id: "stage",
    track: "minmax(130px, 0.7fr)",
    header: "שלב",
    render: project => project.stage?.name ?? "—",
  },
];

const ProjectBoqIndexPage = () => {
  const styles = usePageStyles();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const projects = useProjectPagesQuery({
    search,
    managerId: null,
    projectTypeId: null,
    stageId: null,
  });
  const rows = (projects.data?.pages ?? []).flatMap(page => page.items);
  return (
    <Box sx={styles.page}>
      <Box sx={styles.headerText}>
        <Typography component="h1" sx={styles.heading}>
          כתבי רכש לפרויקטים
        </Typography>
        <Typography sx={styles.description}>
          בחרו פרויקט כדי לצפות בכמויות החומרים ובעלות הרכש המשוערת.
        </Typography>
      </Box>
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={project => project.id}
        onRowClick={project => navigate(ROUTE_PATHS.PROJECT_BOQ.replace(":projectId", project.id))}
        toolbar={
          <TextField
            type={FIELD_TYPES.SEARCH}
            value={search}
            onChange={setSearch}
            title="חיפוש פרויקט"
            placeholder="שם או קוד פרויקט"
          />
        }
        footer={
          <Box sx={styles.spacedRow}>
            <Typography sx={styles.caption}>{rows.length} פרויקטים מוצגים</Typography>
            {projects.hasNextPage && (
              <Button
                text="טען עוד"
                onClick={async () => {
                  await projects.fetchNextPage();
                }}
                isLoading={projects.isFetchingNextPage}
              />
            )}
          </Box>
        }
      />
      {projects.isPending && <LoadingState />}
      {projects.error && <InlineError message={getApiErrorMessage(projects.error)} />}
      {projects.isSuccess && rows.length === 0 && <Typography>לא נמצאו פרויקטים.</Typography>}
    </Box>
  );
};
export default ProjectBoqIndexPage;
