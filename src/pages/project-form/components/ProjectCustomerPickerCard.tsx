import { Box } from "@mui/material";
import { type FC, useState } from "react";
import Card from "../../../components/Card/Card";
import { useStyles } from "./ProjectCustomerPicker.style";
import CustomerPickerOption from "./CustomerPickerOption";
import { ICON_NAMES } from "../../../constants/icon.constant";
import SelectedCustomerSummary from "./SelectedCustomerSummary";
import TextField from "../../../components/TextField/TextField";
import CardHeader from "../../../components/CardHeader/CardHeader";
import InlineError from "../../../components/InlineError/InlineError";
import { SEARCH_DEBOUNCE_MS } from "../../../constants/search.constant";
import { useDebouncedValue } from "../../../hooks/debounced-value.hook";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { getCustomerPickerLabel } from "../../../utilities/customer.utility";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import { useCustomerQuery, useCustomersQuery } from "../../../hooks/queries/customer.query";
import {
  CUSTOMER_PICKER_COPY,
  CUSTOMER_PICKER_RESULT_LIMIT,
} from "../../../constants/customer.constant";

interface IProjectCustomerPickerCardProps {
  customerId: string | null;
  isSubmitAttempted: boolean;
  onChange: (customerId: string | null) => void;
}

const ProjectCustomerPickerCard: FC<IProjectCustomerPickerCardProps> = ({
  onChange,
  customerId,
  isSubmitAttempted,
}) => {
  const styles = useStyles();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const selectedQuery = useCustomerQuery(customerId);
  const customersQuery = useCustomersQuery({ search: debouncedSearch, prioritySyncStatus: null });

  const results = (customersQuery.data ?? []).slice(0, CUSTOMER_PICKER_RESULT_LIMIT);
  const isMissing = isSubmitAttempted && !customerId;
  const hasNoResults = customersQuery.isSuccess && results.length === 0;
  const queryError = selectedQuery.error ?? customersQuery.error;

  const pickCustomer = (pickedId: string) => {
    setSearch("");
    onChange(pickedId);
  };

  return (
    <Card gap="20px" padding="28px" sx={styles.card(isMissing)}>
      <CardHeader
        icon={ICON_NAMES.CUSTOMER}
        title={CUSTOMER_PICKER_COPY.TITLE}
        subtitle={CUSTOMER_PICKER_COPY.SUBTITLE}
      />
      {customerId && selectedQuery.data && (
        <SelectedCustomerSummary customer={selectedQuery.data} onReplace={() => onChange(null)} />
      )}
      {customerId && selectedQuery.isPending && (
        <LoadingState label={CUSTOMER_PICKER_COPY.LOADING} />
      )}
      {!customerId && (
        <>
          <TextField
            value={search}
            onChange={setSearch}
            type={FIELD_TYPES.SEARCH}
            startIcon={ICON_NAMES.SEARCH}
            placeholder={CUSTOMER_PICKER_COPY.SEARCH_PLACEHOLDER}
          />
          <Box role="listbox" sx={styles.list}>
            <Box component="span" sx={styles.listLabel}>
              {getCustomerPickerLabel(debouncedSearch)}
            </Box>
            {customersQuery.isPending && <LoadingState label={CUSTOMER_PICKER_COPY.LOADING} />}
            {results.map(customer => (
              <CustomerPickerOption key={customer.id} customer={customer} onPick={pickCustomer} />
            ))}
            {hasNoResults && (
              <Box component="span" sx={styles.emptyRow}>
                {CUSTOMER_PICKER_COPY.NO_RESULTS}
              </Box>
            )}
          </Box>
          {isMissing && <InlineError message={CUSTOMER_PICKER_COPY.REQUIRED} />}
        </>
      )}
      {queryError && <InlineError message={getApiErrorMessage(queryError)} />}
    </Card>
  );
};

export default ProjectCustomerPickerCard;
