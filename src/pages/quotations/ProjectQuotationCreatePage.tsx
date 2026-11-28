import { useState } from "react";
import { Box } from "@mui/material";
import styles from "./quotation.module.css";
import Card from "../../components/Card/Card";
import Button from "./components/QuotationButton";
import type { IApiProject } from "../../interfaces/api.interface";
import InlineError from "../../components/InlineError/InlineError";
import { buildQuotationPath } from "../../utilities/route.utility";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProjectQuery } from "../../hooks/queries/project.query";
import { quotationService } from "../../services/quotation.service";
import LoadingState from "../../components/LoadingState/LoadingState";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { QUOTATION_QUERY_KEY } from "../../constants/quotation.constant";
import QuotationSalesAgentPicker from "./components/QuotationSalesAgentPicker";
import { QUOTATION_SHARING_KEYS } from "../../constants/quotation-sharing.constant";
import { AuthorizationContext } from "../../managers/authorization-context.manager";

const ProjectQuotationCreateForm = ({ project }: { project: IApiProject }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [salesAgentId, setSalesAgentId] = useState<string | null>(null);
  const create = useMutation({
    mutationFn: quotationService.create,
    onMutate: () => new AuthorizationContext(),
    onSuccess: async (_quotation, _input, authorization) => {
      authorization.assertCurrent();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUOTATION_QUERY_KEY }),
        queryClient.invalidateQueries({
          queryKey: QUOTATION_SHARING_KEYS.projectQuotations(project.id),
        }),
      ]);
      authorization.assertCurrent();
    },
  });

  const submit = () => {
    if (!project.customerId || create.isPending) return;
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
  if (project.isPending) return <LoadingState label="טוען פרויקט..." />;
  if (project.isError) return <InlineError message={getApiErrorMessage(project.error)} />;
  return (
    <Box component="main" className={styles.page}>
      <ProjectQuotationCreateForm key={project.data.id} project={project.data} />
    </Box>
  );
};

export default ProjectQuotationCreatePage;
