import type {
  IEstimateSample,
  IEngineeringEstimate,
} from "../../../interfaces/engineering-estimate.interface";

import { useState, type FC } from "react";
import EstimatePlans from "./EstimatePlans";
import { Box, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { usePageStyles } from "../../page.style";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../../components/Button/Button";
import SelectField from "../../../components/SelectField/SelectField";
import { buildQuotationPath } from "../../../utilities/route.utility";
import { quotationService } from "../../../services/quotation.service";
import { QUOTATION_STATUS } from "../../../constants/quotation.constant";
import { FileDownloadManager } from "../../../managers/file-download.manager";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import QuotationCustomerPicker from "../../quotations/components/QuotationCustomerPicker";
import { engineeringEstimateService } from "../../../services/engineering-estimate.service";

interface IEstimateOutputsProps {
  busy: boolean;
  canEdit: boolean;
  canQuote: boolean;
  canBrowse: boolean;
  canApprove: boolean;
  estimate: IEngineeringEstimate;
  run: (command: () => Promise<void>) => void;
}

const EstimateOutputs: FC<IEstimateOutputsProps> = ({
  busy,
  estimate,
  canEdit,
  canBrowse,
  canApprove,
  canQuote,
  run,
}) => {
  const styles = usePageStyles();
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState("");
  const [sampleByArea, setSampleByArea] = useState<Record<string, string>>({});
  const quotationId = estimate.quotationId ?? "";
  const quotation = useQuery({
    enabled: quotationId !== "",
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
  const approved = estimate.status === "approved";
  const canDownloadProposal = approved && quotation.data?.status === QUOTATION_STATUS.APPROVED;
  const hasSketch = estimate.status === "sketch" || approved;
  const canCreateSketch = canEdit && !approved && validSamples && !busy;
  const canCreateQuotation = canQuote && approved && !estimate.quotationId;
  const needsCustomer = estimate.projectId === null;
  const quoteBlocked = busy || (needsCustomer && !customerId);

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
        customerId || null,
      );
      navigate(buildQuotationPath(quotationId));
    });
  };

  return (
    <Box sx={styles.stack({ gap: "12px" })}>
      <EstimatePlans
        run={run}
        busy={busy}
        canEdit={canEdit}
        estimate={estimate}
        canBrowse={canBrowse}
        key={estimate.projectId ?? ""}
      />
      {canEdit && !approved && (
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
      {missingPrice && (
        <Typography role="status">יש להשלים מחירי קטלוג לפני אישור ויציאה ללקוח.</Typography>
      )}
      {questionsOpen && (
        <Typography role="status">יש לענות על שאלות הבירור לפני אישור הסקיצה.</Typography>
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
      {approved && !canDownloadProposal && (
        <Typography>להפקת ההצעה ללקוח, צרו תחילה טיוטת הצעת מחיר ואשרו אותה.</Typography>
      )}
      {canDownloadProposal && (
        <Button
          text="הורדת הצעה ללקוח (PDF)"
          disabled={busy || missingPrice}
          onClick={(): void => download("proposal")}
        />
      )}
      {canCreateQuotation && (
        <>
          {needsCustomer && (
            <QuotationCustomerPicker disabled={busy} value={customerId} onChange={setCustomerId} />
          )}
          <Button disabled={quoteBlocked} onClick={createQuotation} text="יצירת טיוטת הצעת מחיר" />
        </>
      )}
      {estimate.quotationId && canQuote && (
        <Link to={buildQuotationPath(estimate.quotationId)}>פתיחת הצעת המחיר המקושרת</Link>
      )}
    </Box>
  );
};

export default EstimateOutputs;
