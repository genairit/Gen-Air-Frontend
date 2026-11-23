import type { FC } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useStyles } from "./TaskHistory.style";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import CardHeader from "../../../components/CardHeader/CardHeader";
import InlineError from "../../../components/InlineError/InlineError";
import { buildQuotationPath } from "../../../utilities/route.utility";
import { useTaskQuotations } from "../../../hooks/task-quotation.hook";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { QUOTATION_STATUS_LABELS } from "../../../constants/quotation.constant";
import { TASK_QUOTATION_COPY } from "../../../constants/task-quotation.constant";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

interface ITaskQuotationsProps {
  taskId: string;
}

const TaskQuotations: FC<ITaskQuotationsProps> = ({ taskId }) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { query, mutation, create, canRead, canCreate } = useTaskQuotations(taskId);
  const quotations = query.data?.quotations ?? [];
  const hasQuotations = quotations.length > 0;
  const showCreate = !hasQuotations && canCreate && query.data?.canCreate;
  const showEmptyRead =
    query.isSuccess && !hasQuotations && !showCreate && !query.data.unavailableReason;
  const isBlocked = !hasQuotations && query.data?.unavailableReason;
  const emptyCopy = query.data?.projectId
    ? TASK_QUOTATION_COPY.EMPTY
    : TASK_QUOTATION_COPY.CUSTOMER_ONLY;
  const orderedQuotations = [...quotations].sort(
    (first, second) => Number(second.isPrimary) - Number(first.isPrimary),
  );

  if (!canRead) {
    return null;
  }

  return (
    <Card gap="14px">
      <Box sx={styles.empty} component="section" aria-label={TASK_QUOTATION_COPY.TITLE}>
        <CardHeader title={TASK_QUOTATION_COPY.TITLE} />
        {query.isPending && <LoadingState label={TASK_QUOTATION_COPY.LOADING} />}
        {query.isError && <InlineError message={getApiErrorMessage(query.error)} />}
        {query.isError && (
          <Button
            text={TASK_QUOTATION_COPY.RETRY}
            onClick={async () => {
              await query.refetch();
            }}
          />
        )}
        {showEmptyRead && <Box sx={styles.caption}>{TASK_QUOTATION_COPY.EMPTY_READ}</Box>}
        {isBlocked && <Box sx={styles.caption}>{TASK_QUOTATION_COPY.BLOCKED}</Box>}
        {showCreate && <Box sx={styles.caption}>{emptyCopy}</Box>}
        {showCreate && (
          <Button
            onClick={create}
            disabled={mutation.isPending}
            isLoading={mutation.isPending}
            text={TASK_QUOTATION_COPY.CREATE}
          />
        )}
        {mutation.isError && <InlineError message={getApiErrorMessage(mutation.error)} />}
        {orderedQuotations.map(quotation => (
          <Box key={quotation.id} sx={styles.footer}>
            <Box sx={styles.badge}>
              <Box component="bdi">{quotation.number}</Box>
              <Box component="span" sx={styles.caption}>
                {QUOTATION_STATUS_LABELS[quotation.status]}
              </Box>
            </Box>
            <Button
              text="פתיחת הצעה"
              variant={BUTTON_VARIANTS.NEUTRAL}
              ariaLabel={`פתיחת הצעה ${quotation.number}`}
              onClick={() => navigate(buildQuotationPath(quotation.id))}
            />
          </Box>
        ))}
      </Box>
    </Card>
  );
};

export default TaskQuotations;
