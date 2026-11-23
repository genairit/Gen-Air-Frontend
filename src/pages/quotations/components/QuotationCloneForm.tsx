import { Box } from "@mui/material";
import Button from "./QuotationButton";
import { useRef, useState } from "react";
import styles from "../quotation.module.css";
import QuotationSelect from "./QuotationSelect";
import Card from "../../../components/Card/Card";
import type { FC, FormEvent, ReactElement } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useElementFocus } from "../../../hooks/element-focus.hook";
import { QUOTATION_CLONE_STYLES } from "./QuotationCloneForm.style";
import { BUTTON_TYPES } from "../../../constants/button-type.constant";
import { quotationService } from "../../../services/quotation.service";
import NoticeBanner from "../../../components/NoticeBanner/NoticeBanner";
import type { IQuotation } from "../../../interfaces/quotation.interface";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { cloneBrandOptions } from "../../../utilities/quotation-clone.utility";
import { completeQuotationClone } from "../../../actions/quotation-clone.actions";
import type { ICloneFailure } from "../../../interfaces/quotation-clone.interface";
import { useQuotationCloneCommand } from "../../../hooks/quotation-clone-command.hook";

interface ICloneFormProps {
  sourceId: string;
  onCancel: () => void;
}

const QuotationCloneForm: FC<ICloneFormProps> = ({ sourceId, onCancel }): ReactElement => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const command = useQuotationCloneCommand(sourceId, location.key);
  const [targetBrand, setTargetBrand] = useState((): string => command.getTargetBrand());
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<ICloneFailure | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const source = useQuery({
    queryKey: ["quotation-clone-source", sourceId],
    queryFn: (): Promise<IQuotation> => quotationService.get(sourceId),
  });
  useElementFocus(errorRef, failure !== null, failure);
  const retainedCommand = command.getCommand();
  const canRecover = retainedCommand !== null && retainedCommand.targetBrand === targetBrand;
  const sourceBrand = source.data?.brands[0] ?? null;
  const hasSingleSourceBrand = source.isSuccess && source.data.brands.length === 1;
  const canCreate = hasSingleSourceBrand && targetBrand !== sourceBrand;
  const brandOptions = cloneBrandOptions(sourceBrand, retainedCommand?.targetBrand ?? null);
  const createDisabled =
    !targetBrand || pending || failure?.staleSource === true || (!canRecover && !canCreate);
  const idleText = canRecover ? "בדוק תוצאת היצירה" : "צור הצעה חדשה";
  const createText = pending ? "יוצר הצעה חדשה..." : idleText;
  const selectorDisabled = pending || (!hasSingleSourceBrand && canRecover);
  const sourceLabel = source.isSuccess ? source.data.number : "בקשת יצירה קודמת";

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const sourceVersion = retainedCommand?.sourceVersion ?? source.data?.version ?? null;
    if (createDisabled || sourceVersion === null) {
      return;
    }

    await command.submit({
      targetBrand,
      sourceVersion,
      execute: quotationService.cloneRecommended,
      onPending: setPending,
      onFailure: setFailure,
      onSuccess: (quotation, isCurrent): Promise<void> =>
        completeQuotationClone({ quotation, queryClient, navigate, isCurrent }),
    });
  };

  if (source.isPending && !canRecover) {
    return (
      <Box component="p" role="status">
        טוען הצעת מקור...
      </Box>
    );
  }

  if (source.isError && !canRecover) {
    return (
      <NoticeBanner
        variant="error"
        title={getApiErrorMessage(source.error)}
        actions={
          <Box className={styles.row}>
            <Button
              text="נסה שוב"
              onClick={async (): Promise<void> => {
                await source.refetch();
              }}
            />
            <Button text="חזרה להצעת המקור" onClick={onCancel} />
          </Box>
        }
      />
    );
  }

  if (!hasSingleSourceBrand && !canRecover) {
    return (
      <NoticeBanner
        variant="error"
        title="אפשר לשכפל רק הצעה עם חברת מיזוג אחת."
        actions={<Button onClick={onCancel} text="חזרה להצעת המקור" />}
      />
    );
  }

  const staleSourceAction = failure?.staleSource ? (
    <Button
      text="רענן הצעת מקור"
      disabled={source.isFetching}
      onClick={(): Promise<void> =>
        command.refreshSource({ refresh: source.refetch, onFailure: setFailure })
      }
    />
  ) : null;
  const emptyTargetView = targetBrand ? null : (
    <Box component="p" sx={QUOTATION_CLONE_STYLES.description}>
      בחר חברה כדי ליצור הצעה חדשה.
    </Box>
  );
  const failureView = failure ? (
    <Box tabIndex={-1} ref={errorRef} sx={QUOTATION_CLONE_STYLES.error}>
      <NoticeBanner
        variant="error"
        title={failure.title}
        lines={failure.lines}
        actions={staleSourceAction}
      />
    </Box>
  ) : null;
  const recoveryNotice =
    canRecover && !source.isSuccess ? (
      <NoticeBanner title="ניתן לבדוק את תוצאת בקשת היצירה הקודמת גם כשהצעת המקור אינה זמינה כעת." />
    ) : null;

  return (
    <Card sx={QUOTATION_CLONE_STYLES.card} ariaLabel="יצירת העתק לחברת מיזוג אחרת">
      <Box component="form" onSubmit={submit} aria-busy={pending} sx={QUOTATION_CLONE_STYLES.form}>
        <Box component="h2" sx={QUOTATION_CLONE_STYLES.title}>
          יצירת העתק לחברת מיזוג אחרת · <Box component="bdi">{sourceLabel}</Box>
        </Box>
        <Box component="p" sx={QUOTATION_CLONE_STYLES.description}>
          ההצעה החדשה תיווצר עם פריטי הקטלוג המוצעים לחברה שנבחרה, וניתן לערוך אותה לאחר היצירה.
          הלקוח, הפרויקט, הכמויות והפריטים הכלליים יישמרו. התאריך וההנחה יתאפסו.
        </Box>
        <QuotationSelect
          value={targetBrand}
          items={brandOptions}
          label="חברת מיזוג חדשה"
          disabled={selectorDisabled}
          onChange={(event): void => {
            command.reset();
            setFailure(null);
            setTargetBrand(event.target.value);
          }}
        />
        {emptyTargetView}
        {recoveryNotice}
        {failureView}
        <Box sx={QUOTATION_CLONE_STYLES.actions}>
          <Button
            text={createText}
            isLoading={pending}
            disabled={createDisabled}
            type={BUTTON_TYPES.SUBMIT}
          />
          <Button onClick={onCancel} disabled={pending} text="חזרה להצעת המקור" />
        </Box>
      </Box>
    </Card>
  );
};

export default QuotationCloneForm;
