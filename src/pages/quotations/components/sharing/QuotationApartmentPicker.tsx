import {
  formatSelectAll,
  formatSelectedCount,
  formatEndCustomerName,
  formatApartmentChoice,
  formatApartmentChoiceLabel,
} from "../../../../utilities/quotation-sharing.utility";

import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
} from "../../../../components/Button/constants/button.constants";

import type { FC } from "react";
import { Box } from "@mui/material";
import Button from "../../../../components/Button/Button";
import { useStyles } from "./QuotationApartmentSharing.style";
import CheckBox from "../../../../components/CheckBox/CheckBox";
import { ICON_NAMES } from "../../../../constants/icon.constant";
import TextField from "../../../../components/TextField/TextField";
import { QUOTATION_SHARING_COPY } from "../../../../constants/quotation-sharing.constant";
import { FIELD_TYPES } from "../../../../components/TextField/constants/textfield.constants";
import type { TQuotationApartmentSharing } from "../../../../hooks/quotation-apartment-sharing.hook";

interface IQuotationApartmentPickerProps {
  sharing: TQuotationApartmentSharing;
}

const QuotationApartmentPicker: FC<IQuotationApartmentPickerProps> = ({ sharing }) => {
  const styles = useStyles();

  const selectedCount = sharing.selection.selectedIds.length;
  const hasNoResults = sharing.visibleApartments.length === 0;

  return (
    <Box sx={styles.panel}>
      <TextField
        value={sharing.search}
        type={FIELD_TYPES.SEARCH}
        disabled={sharing.isLocked}
        onChange={sharing.setSearch}
        startIcon={ICON_NAMES.SEARCH}
        title={QUOTATION_SHARING_COPY.SEARCH_TITLE}
        placeholder={QUOTATION_SHARING_COPY.SEARCH_PLACEHOLDER}
      />
      <Box sx={styles.selectAll}>
        <CheckBox
          disabled={sharing.isLocked}
          onChange={sharing.toggleAll}
          value={sharing.selection.isAllSelected}
          text={formatSelectAll(sharing.apartments.length)}
        />
      </Box>
      {hasNoResults && (
        <Box role="status" sx={styles.caption}>
          {QUOTATION_SHARING_COPY.NO_RESULTS}
        </Box>
      )}
      {!hasNoResults && (
        <Box role="group" sx={styles.list} aria-label={QUOTATION_SHARING_COPY.LIST_LABEL}>
          {sharing.visibleApartments.map(apartment => (
            <Box sx={styles.listRow} key={apartment.apartmentId}>
              <CheckBox
                disabled={sharing.isLocked}
                ariaLabel={formatApartmentChoiceLabel(apartment)}
                value={sharing.selection.isSelected(apartment.apartmentId)}
                onChange={() => sharing.toggleApartment(apartment.apartmentId)}
                text={
                  <Box component="span" sx={styles.rowText}>
                    <Box component="bdi">{formatApartmentChoice(apartment)}</Box>
                    <Box component="span" sx={styles.endCustomer}>
                      {formatEndCustomerName(apartment)}
                    </Box>
                  </Box>
                }
              />
            </Box>
          ))}
        </Box>
      )}
      <Box sx={styles.selectionRow}>
        <Box role="status" component="span" sx={styles.caption}>
          {formatSelectedCount(selectedCount)}
        </Box>
        <Button
          onClick={sharing.clear}
          size={BUTTON_SIZES.COMPACT}
          variant={BUTTON_VARIANTS.NEUTRAL}
          text={QUOTATION_SHARING_COPY.CLEAR}
          disabled={sharing.isLocked || selectedCount === 0}
        />
      </Box>
    </Box>
  );
};

export default QuotationApartmentPicker;
