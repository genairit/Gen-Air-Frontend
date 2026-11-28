import type {
  IEstimateSample,
  IEngineeringEstimate,
} from "../../../interfaces/engineering-estimate.interface";

import { useState, type FC } from "react";
import EstimatePlans from "./EstimatePlans";
import EstimateSection from "./EstimateSection";
import { Box, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { usePageStyles } from "../../page.style";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../../components/Button/Button";
import SelectField from "../../../components/SelectField/SelectField";
import { quotationService } from "../../../services/quotation.service";
import { QUOTATION_STATUS } from "../../../constants/quotation.constant";
import { FileDownloadManager } from "../../../managers/file-download.manager";
import { buildQuotationPath, buildProjectPath } from "../../../utilities/route.utility";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { engineeringEstimateService } from "../../../services/engineering-estimate.service";

interface IEstimateOutputsProps {
  busy: boolean;
  canEdit: boolean;
  canBrowse: boolean;
  canApprove: boolean;
  canReadQuotation: boolean;
  canCreateQuotation: boolean;
  canExportQuotation: boolean;
  estimate: IEngineeringEstimate;
  run: (command: () => Promise<void>) => void;
}

const EstimateOutputs: FC<IEstimateOutputsProps> = ({
  busy,
  estimate,
  canEdit,
  canBrowse,
  canApprove,
  canReadQuotation,
  canCreateQuotation,
  canExportQuotation,
  run,
}) => {
  const styles = usePageStyles();
  const navigate = useNavigate();
  const [sampleByArea, setSampleByArea] = useState<Record<string, string>>({});
  const quotationId = estimate.quotationId ?? "";
  const quotation = useQuery({
    enabled:
      canReadQuotation &&
      canExportQuotation &&
      quotationId !== "" &&
      !estimate.quotationUnavailable,
    queryKey: ["engineering-estimate", estimate.id, "quotation", quotationId],
    queryFn: () => quotationService.get(quotationId),
    retry: false,
  });
  const marked = estimate.plans.filter(plan => plan.marked);
  const options = [
    { value: "", label: "ללא תשריט לסקיצה" },
    ...marked.map(plan => ({ value: plan.id, label: plan.name })),
  ];
  const samples = estimate.areas.flatMap((area): IEstimateSample[] => {
    const planId = sampleByArea[area.id] ?? "";
    return marked.some(plan => plan.id === planId) ? [{ areaId: area.id, planId }] : [];
  });
  const uniquePlans = new Set(samples.map(sample => sample.planId));
  const validSamples =
    samples.length >= 1 && samples.length <= 4 && uniquePlans.size === samples.length;
  const missingPrice = estimate.lines.some(line => line.unitPrice === null);
  const questionsOpen = estimate.questions.some(question => question.answer === null);
  const emptyEstimate = estimate.lines.length === 0;
  const sampleAreasPriced = samples.every(sample =>
    estimate.lines.some(line => line.areaId === sample.areaId),
  );
  const approved = estimate.status === "approved";
  const quotationAvailable = !estimate.quotationUnavailable;
  const quotationApproved = quotation.data?.status === QUOTATION_STATUS.APPROVED;
  const mayExport = canReadQuotation && canExportQuotation;
  const canDownloadProposal = approved && mayExport && quotationAvailable && quotationApproved;
  const hasSketch = estimate.status === "sketch" || approved;
  const requiresLineChanges = emptyEstimate || missingPrice || questionsOpen;
  const readyForSketch = validSamples && sampleAreasPriced && !requiresLineChanges;
  const canCreateSketch = canEdit && !hasSketch && readyForSketch && !busy;
  const showQuotationCreation =
    canEdit &&
    canReadQuotation &&
    canCreateQuotation &&
    approved &&
    quotationAvailable &&
    !estimate.quotationId;
  const linkedProjectId = estimate.projectId;
  const missingProject = linkedProjectId === null;
  const missingLinkedCustomer = linkedProjectId !== null && estimate.quotationCustomerId === null;
  const quoteBlocked = busy || missingLinkedCustomer || missingProject;
  const linkedCustomerRepairPath =
    missingLinkedCustomer && linkedProjectId ? buildProjectPath(linkedProjectId) : null;
  const commercialHint = estimate.quotationId
    ? "ה־PDF ללקוח זמין לאחר אישור הצעת המחיר המקושרת."
    : showQuotationCreation
      ? "להפקת ההצעה ללקוח, צרו טיוטת הצעת מחיר ואשרו אותה."
      : "להפקת ההצעה ללקוח נדרש משתמש שמורשה ליצור ולאשר הצעות מחיר.";
  const showCommercialHint =
    approved && mayExport && quotationAvailable && !canDownloadProposal && !quotation.isFetching;
  const canOpenLinkedQuote =
    Boolean(estimate.quotationId) && canReadQuotation && quotationAvailable;
  const showCommercialSection =
    estimate.quotationUnavailable ||
    showCommercialHint ||
    canDownloadProposal ||
    showQuotationCreation ||
    canOpenLinkedQuote;
  const revise = (): void => {
    run((): Promise<void> =>
      engineeringEstimateService.patch(estimate.id, { version: estimate.version }),
    );
  };

  const sketch = (): void => {
    run(async (): Promise<void> => {
      const pdf = await engineeringEstimateService.sketch(estimate.id, estimate.version, samples);
      FileDownloadManager.download(pdf, `${estimate.name} - סקיצה.pdf`);
    });
  };
  const download = (kind: "sketch" | "proposal"): void => {
    const fetchPdf =
      kind === "sketch"
        ? engineeringEstimateService.downloadSketch
        : engineeringEstimateService.proposal;
    const name = kind === "sketch" ? "סקיצה" : "הצעת מחיר";
    run(async (): Promise<void> => {
      const pdf = await fetchPdf(estimate.id);
      FileDownloadManager.download(pdf, `${estimate.name} - ${name}.pdf`);
    });
  };
  const createQuotation = (): void => {
    run(async (): Promise<void> => {
      const quotationId = await engineeringEstimateService.quotation(
        estimate.id,
        estimate.version,
        estimate.quotationCustomerId,
      );
      navigate(buildQuotationPath(quotationId));
    });
  };

  return (
    <Box sx={styles.stack({ gap: "12px" })}>
      <EstimateSection title="תוכניות">
        <EstimatePlans
          run={run}
          busy={busy}
          canEdit={canEdit}
          estimate={estimate}
          canBrowse={canBrowse}
          key={estimate.projectId ?? ""}
        />
      </EstimateSection>
      <EstimateSection title="סקיצה ואישור">
        {canEdit && !hasSketch && (
          <>
            <Typography>בחרו תשריט מסומן שונה לכל אזור להדגמה, עד ארבעה אזורים.</Typography>
            {estimate.areas.map((area): React.JSX.Element => {
              const title = `תשריט לסקיצה: ${area.name}`;
              return (
                <SelectField
                  key={area.id}
                  title={title}
                  items={options}
                  disabled={busy}
                  ariaLabel={title}
                  value={sampleByArea[area.id] ?? ""}
                  onChange={(event): void =>
                    setSampleByArea({ ...sampleByArea, [area.id]: event.target.value })
                  }
                />
              );
            })}
            {!sampleAreasPriced && (
              <Typography role="status">יש להוסיף פריטים מתומחרים לכל אזור שנבחר.</Typography>
            )}
            <Button onClick={sketch} text="הפקת סקיצה לאישור" disabled={!canCreateSketch} />
          </>
        )}
        {hasSketch && (
          <Button
            disabled={busy}
            text="הורדת הסקיצה השמורה"
            variant={BUTTON_VARIANTS.SECONDARY}
            onClick={(): void => download("sketch")}
          />
        )}
        {emptyEstimate && <Typography role="status">יש להוסיף פריטים לפני הפקת הסקיצה.</Typography>}
        {missingPrice && (
          <Typography role="status">יש להשלים מחירי קטלוג לפני הפקת הסקיצה.</Typography>
        )}
        {questionsOpen && (
          <Typography role="status">יש לענות על שאלות הבירור לפני הפקת הסקיצה.</Typography>
        )}
        {canApprove && estimate.status === "sketch" && (
          <Button
            text="אישור גרסת הסקיצה"
            disabled={busy || missingPrice || questionsOpen}
            onClick={(): void =>
              run((): Promise<void> =>
                engineeringEstimateService.approve(estimate.id, estimate.version),
              )
            }
          />
        )}
      </EstimateSection>
      {showCommercialSection && (
        <EstimateSection title="הצעת מחיר">
          {estimate.quotationUnavailable && (
            <Box sx={styles.stack({ gap: "8px" })}>
              <Typography role="status">
                הצעת המחיר המקושרת הוסרה. לפתיחת הצעה נוספת, צרו גרסת כתב כמויות חדשה.
              </Typography>
              {canEdit && (
                <Button
                  disabled={busy}
                  onClick={revise}
                  text="פתיחת גרסה חדשה"
                  variant={BUTTON_VARIANTS.SECONDARY}
                />
              )}
            </Box>
          )}
          {showCommercialHint && <Typography>{commercialHint}</Typography>}
          {canDownloadProposal && (
            <Button
              text="הורדת הצעה ללקוח (PDF)"
              disabled={busy || missingPrice}
              onClick={(): void => download("proposal")}
            />
          )}
          {showQuotationCreation && (
            <>
              {linkedCustomerRepairPath && (
                <Box sx={styles.stack({ gap: "8px" })}>
                  <Typography role="status">
                    בפרויקט המקושר לא הוגדר לקוח בזמן הסקיצה. שייכו לקוח בפרויקט, פתחו גרסה חדשה
                    ואשרו אותה.
                  </Typography>
                  <Link to={linkedCustomerRepairPath}>פתיחת הפרויקט המקושר</Link>
                  <Button
                    disabled={busy}
                    onClick={revise}
                    text="פתיחת גרסה חדשה"
                    variant={BUTTON_VARIANTS.SECONDARY}
                  />
                </Box>
              )}
              {missingProject && (
                <Box sx={styles.stack({ gap: "8px" })}>
                  <Typography role="status">
                    כדי ליצור הצעת מחיר, פתחו גרסה חדשה, שייכו אותה לפרויקט עם לקוח ואשרו אותה.
                  </Typography>
                  <Button
                    disabled={busy}
                    onClick={revise}
                    text="פתיחת גרסה חדשה"
                    variant={BUTTON_VARIANTS.SECONDARY}
                  />
                </Box>
              )}
              <Button
                disabled={quoteBlocked}
                onClick={createQuotation}
                text="יצירת טיוטת הצעת מחיר"
              />
            </>
          )}
          {canOpenLinkedQuote && (
            <Link to={buildQuotationPath(quotationId)}>פתיחת הצעת המחיר המקושרת</Link>
          )}
        </EstimateSection>
      )}
    </Box>
  );
};

export default EstimateOutputs;
