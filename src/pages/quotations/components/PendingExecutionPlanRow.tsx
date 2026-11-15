import type { FC } from "react";
import styles from "../quotation.module.css";
import { Box, ButtonBase } from "@mui/material";
import type { IExecutionPlanSubmission } from "../../../interfaces/execution-plan.interface";

interface IPendingExecutionPlanRowProps {
  onOpen: () => void;
  quotationId: string;
  submissions: IExecutionPlanSubmission[];
}

const PendingExecutionPlanRow: FC<IPendingExecutionPlanRowProps> = ({
  quotationId,
  submissions,
  onOpen,
}) => {
  const quotationNumber =
    submissions.find(submission => submission.quotation != null)?.quotation?.number ?? quotationId;

  return (
    <ButtonBase
      onClick={onOpen}
      className={styles.quoteRow}
      sx={{ display: "grid", gap: "8px", textAlign: "start" }}
    >
      <Box component="bdi" className={styles.number}>
        {quotationNumber}
      </Box>
      {submissions.map(submission => {
        const submitter = submission.submitter
          ? `${submission.submitter.firstName} ${submission.submitter.lastName}`
          : "—";
        const submittedAt = submission.submittedAt
          ? new Date(submission.submittedAt).toLocaleDateString("he-IL")
          : "—";
        return (
          <Box
            component="span"
            key={submission.id}
            sx={{
              display: "grid",
              gap: "8px",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            }}
          >
            <Box component="span">
              {submission.project?.name ?? submission.projectId}
              {submission.project?.code && <Box component="bdi"> · {submission.project.code}</Box>}
            </Box>
            <Box component="span">{submitter}</Box>
            <Box dir="auto" component="span">
              {submission.driveFileName} · {submission.planVersion}
            </Box>
            <Box component="span">{submittedAt}</Box>
          </Box>
        );
      })}
    </ButtonBase>
  );
};

export default PendingExecutionPlanRow;
