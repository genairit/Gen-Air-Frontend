import { useState } from "react";
import { Box } from "@mui/material";
import styles from "./quotation.module.css";
import Card from "../../components/Card/Card";
import Button from "./components/QuotationButton";
import type { IApiProject } from "../../interfaces/api.interface";
import InlineError from "../../components/InlineError/InlineError";
import { buildQuotationPath } from "../../utilities/route.utility";
import { useProjectQuery } from "../../hooks/queries/project.query";
import LoadingState from "../../components/LoadingState/LoadingState";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import QuotationSalesAgentPicker from "./components/QuotationSalesAgentPicker";
import { useCreateProjectQuotation } from "../../hooks/queries/quotation.query";

const ProjectQuotationCreateForm = ({ project }: { project: IApiProject }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [salesAgentId, setSalesAgentId] = useState<string | null>(null);
  const create = useCreateProjectQuotation();

  const submit = () => {
    if (!project.customerId || create.isPending) {
      return;
    }

    create.mutate(
      { customerId: project.customerId, projectId: project.id, salesAgentId },
      {
        onSuccess: quotation =>
          navigate(buildQuotationPath(quotation.id), { replace: true, state: location.state }),
      },
    );
  };

  return (
    <Card ariaLabel="הצעת מחיר חדשה">
      <Box component="h1" className={styles.listTitle}>
        הצעת מחיר חדשה
      </Box>
      <Box>
        {project.name}
        {project.customer?.name && ` · ${project.customer.name}`}
      </Box>
      {project.customerId ? (
        <>
          <QuotationSalesAgentPicker
            value={salesAgentId}
            onChange={setSalesAgentId}
            disabled={create.isPending}
          />
          <Button onClick={submit} text="יצירת הצעה" isLoading={create.isPending} />
        </>
      ) : (
        <InlineError message="יש לקשר לקוח לפרויקט כדי ליצור הצעת מחיר." />
      )}
      {create.isError && <InlineError message={getApiErrorMessage(create.error)} />}
    </Card>
  );
};

const ProjectQuotationCreatePage = () => {
  const { projectId } = useParams();
  const project = useProjectQuery(projectId ?? null);
  if (project.isPending) {
    return <LoadingState label="טוען פרויקט..." />;
  }

  if (project.isError) {
    return <InlineError message={getApiErrorMessage(project.error)} />;
  }

  return (
    <Box component="main" className={styles.page}>
      <ProjectQuotationCreateForm key={project.data.id} project={project.data} />
    </Box>
  );
};

export default ProjectQuotationCreatePage;
