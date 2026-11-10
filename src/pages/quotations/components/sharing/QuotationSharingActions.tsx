import type { FC } from "react";
import { Box } from "@mui/material";
import Button from "../../../../components/Button/Button";
import { useStyles } from "./QuotationApartmentSharing.style";
import { QUOTATION_SHARING_COPY } from "../../../../constants/quotation-sharing.constant";
import { BUTTON_VARIANTS } from "../../../../components/Button/constants/button.constants";
import type { TQuotationApartmentSharing } from "../../../../hooks/quotation-apartment-sharing.hook";

interface IQuotationSharingActionsProps {
  sharing: TQuotationApartmentSharing;
}

const QuotationSharingActions: FC<IQuotationSharingActionsProps> = ({ sharing }) => {
  const styles = useStyles();

  const saveLabel = sharing.isRemoving
    ? QUOTATION_SHARING_COPY.REMOVE
    : QUOTATION_SHARING_COPY.SAVE;
  const isCancelDisabled = !sharing.isDirty || sharing.isLocked;

  return (
    <>
      {sharing.needsSelection && (
        <Box component="span" sx={styles.caption}>
          {QUOTATION_SHARING_COPY.SELECT_AT_LEAST_ONE}
        </Box>
      )}
      <Box sx={styles.actions}>
        <Button
          text={saveLabel}
          onClick={sharing.save}
          disabled={!sharing.canSave}
          isLoading={sharing.isPending}
        />
        <Button
          onClick={sharing.cancel}
          disabled={isCancelDisabled}
          variant={BUTTON_VARIANTS.NEUTRAL}
          text={QUOTATION_SHARING_COPY.CANCEL}
        />
      </Box>
    </>
  );
};

export default QuotationSharingActions;
