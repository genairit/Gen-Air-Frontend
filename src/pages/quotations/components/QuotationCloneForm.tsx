import { Box } from "@mui/material";
import Button from "./QuotationButton";
import { useRef, useState } from "react";
import type { FC, FormEvent } from "react";
import styles from "../quotation.module.css";
import QuotationSelect from "./QuotationSelect";
import Card from "../../../components/Card/Card";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useElementFocus } from "../../../hooks/element-focus.hook";
import { QUOTATION_CLONE_STYLES } from "./QuotationCloneForm.style";
import { quotationService } from "../../../services/quotation.service";
import NoticeBanner from "../../../components/NoticeBanner/NoticeBanner";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { cloneBrandOptions } from "../../../utilities/quotation-clone.utility";
import { completeQuotationClone } from "../../../actions/quotation-clone.actions";
import type { ICloneFailure } from "../../../interfaces/quotation-clone.interface";
import { useQuotationCloneCommand } from "../../../hooks/quotation-clone-command.hook";

const QuotationCloneForm: FC<{ sourceId: string; onCancel: () => void }> = ({
  sourceId,
  onCancel,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const command = useQuotationCloneCommand(sourceId, location.key);
  const [targetBrand, setTargetBrand] = useState(() => command.getTargetBrand());
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<ICloneFailure | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const source = useQuery({
    queryKey: ["quotation-clone-source", sourceId],
    queryFn: () => quotationService.get(sourceId),
  });
  useElementFocus(errorRef, failure !== null, failure);
  const brandOptions = cloneBrandOptions(source.data?.brands[0] ?? null);
  const createDisabled = !targetBrand || pending || failure?.staleSource === true;
  const createText = pending ? "יוצר הצעה חדשה..." : "צור הצעה חדשה";

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!source.data || !targetBrand || source.data.brands.length !== 1 || failure?.staleSource) {
      return;
    }

    await command.submit({
      targetBrand,
      sourceVersion: source.data.version,
      execute: quotationService.cloneRecommended,
      onPending: setPending,
      onFailure: setFailure,
      onSuccess: (quotation, isCurrent) =>
        completeQuotationClone({ quotation, queryClient, navigate, isCurrent }),
    });
  };

  if (source.isPending) {
    return (
      <Box component="p" role="status">
        טוען הצעת מקור...
      </Box>
    );
  }

  if (source.isError) {
    return (
      <NoticeBanner
        variant="error"
        title={getApiErrorMessage(source.error)}
        actions={
          <Box className={styles.row}>
            <Button
              text="נסה שוב"
              onClick={async () => {
                await source.refetch();
              }}
            />
            <Button text="חזרה להצעת המקור" onClick={onCancel} />
          </Box>
        }
      />
    );
  }

  if (source.data.brands.length !== 1) {
    return (
      <NoticeBanner
        variant="error"
        title="אפשר לשכפל רק הצעה עם חברת מיזוג אחת."
        actions={<Button onClick={onCancel} text="חזרה להצעת המקור" />}
      />
    );
  }

  return (
    <Card sx={QUOTATION_CLONE_STYLES.card} ariaLabel="יצירת העתק לחברת מיזוג אחרת">
      <Box component="form" onSubmit={submit} aria-busy={pending} sx={QUOTATION_CLONE_STYLES.form}>
        <Box component="h2" sx={QUOTATION_CLONE_STYLES.title}>
          יצירת העתק לחברת מיזוג אחרת · <Box component="bdi">{source.data.number}</Box>
        </Box>
        <Box component="p" sx={QUOTATION_CLONE_STYLES.description}>
          ההצעה החדשה תיווצר עם פריטי הקטלוג המוצעים לחברה שנבחרה, וניתן לערוך אותה לאחר היצירה.
          הלקוח, הפרויקט, הכמויות והפריטים הכלליים יישמרו. התאריך וההנחה יתאפסו.
        </Box>
        <QuotationSelect
          disabled={pending}
          value={targetBrand}
          items={brandOptions}
          label="חברת מיזוג חדשה"
          onChange={event => {
            command.reset();
            setFailure(null);
            setTargetBrand(event.target.value);
          }}
        />
        {!targetBrand && (
          <Box component="p" sx={QUOTATION_CLONE_STYLES.description}>
            בחר חברה כדי ליצור הצעה חדשה.
          </Box>
        )}
        {failure && (
          <Box tabIndex={-1} ref={errorRef} sx={QUOTATION_CLONE_STYLES.error}>
            <NoticeBanner
              variant="error"
              title={failure.title}
              lines={failure.lines}
              actions={
                failure.staleSource ? (
                  <Button
                    text="רענן הצעת מקור"
                    disabled={source.isFetching}
                    onClick={() =>
                      command.refreshSource({ refresh: source.refetch, onFailure: setFailure })
                    }
                  />
                ) : null
              }
            />
          </Box>
        )}
        <Box sx={QUOTATION_CLONE_STYLES.actions}>
          <Button type="submit" text={createText} isLoading={pending} disabled={createDisabled} />
          <Button onClick={onCancel} disabled={pending} text="חזרה להצעת המקור" />
        </Box>
      </Box>
    </Card>
  );
};

export default QuotationCloneForm;
