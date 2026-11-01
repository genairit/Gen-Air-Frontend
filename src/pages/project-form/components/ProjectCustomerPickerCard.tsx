import {
  CUSTOMER_PICKER_COPY,
  CUSTOMER_PICKER_RESULT_LIMIT,
} from "../../../constants/customer.constant";

import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { type FC, useState } from "react";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import { useStyles } from "./ProjectCustomerPicker.style";
import CustomerPickerOption from "./CustomerPickerOption";
import { useSessionUser } from "../../../store/session.store";
import { ICON_NAMES } from "../../../constants/icon.constant";
import SelectedCustomerSummary from "./SelectedCustomerSummary";
import TextField from "../../../components/TextField/TextField";
import { ROUTE_PATHS } from "../../../constants/routes.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { PERMISSIONS } from "../../../constants/permission.constant";
import { hasPermission } from "../../../utilities/permission.utility";
import InlineError from "../../../components/InlineError/InlineError";
import { SEARCH_DEBOUNCE_MS } from "../../../constants/search.constant";
import { useDebouncedValue } from "../../../hooks/debounced-value.hook";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { isCustomerSelectable } from "../../../utilities/customer.utility";
import { APARTMENT_TEAM_COPY } from "../../../constants/apartment.constant";
import { getCustomerPickerLabel } from "../../../utilities/customer.utility";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import { useCustomerQuery, useCustomersQuery } from "../../../hooks/queries/customer.query";

interface IProjectCustomerPickerCardProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  isApartment?: boolean;
  customerId: string | null;
  isSubmitAttempted: boolean;
  onChange: (customerId: string | null) => void;
}

const ProjectCustomerPickerCard: FC<IProjectCustomerPickerCardProps> = ({
  onChange,
  customerId,
  isSubmitAttempted,
  action,
  isApartment = false,
  title = CUSTOMER_PICKER_COPY.TITLE,
  subtitle = CUSTOMER_PICKER_COPY.SUBTITLE,
}) => {
  const styles = useStyles();
  const sessionUser = useSessionUser();
  const canCreateCustomer = hasPermission(sessionUser, PERMISSIONS.CUSTOMERS_CREATE);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const selectedQuery = useCustomerQuery(customerId);
  const customersQuery = useCustomersQuery({ search: debouncedSearch, prioritySyncStatus: null });

  const results = (customersQuery.data ?? []).slice(0, CUSTOMER_PICKER_RESULT_LIMIT);
  const isMissing = isSubmitAttempted && !customerId;
  const hasNoResults = customersQuery.isSuccess && results.length === 0;
  const cardPadding = isApartment ? "24px" : "28px";
  const listStyle = styles.list;
  const requiredMessage = isApartment
    ? APARTMENT_TEAM_COPY.INVALID_CUSTOMER
    : CUSTOMER_PICKER_COPY.REQUIRED;
  const isSelectionBlocked = selectedQuery.isSuccess && !isCustomerSelectable(selectedQuery.data);
  const queryError = selectedQuery.error ?? customersQuery.error;

  const createCustomerAction = canCreateCustomer ? (
    <Box
      target="_blank"
      component={Link}
      sx={styles.link}
      rel="noopener noreferrer"
      to={ROUTE_PATHS.NEW_CUSTOMER}
    >
      {APARTMENT_TEAM_COPY.NEW_CUSTOMER}
    </Box>
  ) : null;
  const cardAction = action ?? createCustomerAction;

  const pickCustomer = (pickedId: string) => {
    setSearch("");
    onChange(pickedId);
  };

  return (
    <Card gap="18px" padding={cardPadding} sx={styles.card(isMissing)}>
      <CardHeader
        title={title}
        action={cardAction}
        subtitle={subtitle}
        icon={ICON_NAMES.CUSTOMER}
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
          <Box role="listbox" sx={listStyle}>
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
          {isMissing && <InlineError message={requiredMessage} />}
        </>
      )}
      {isSelectionBlocked && <InlineError message={CUSTOMER_PICKER_COPY.BLOCKED} />}
      {queryError && (
        <>
          <InlineError message={getApiErrorMessage(queryError)} />
          <Button
            text={APARTMENT_TEAM_COPY.RETRY}
            variant={BUTTON_VARIANTS.NEUTRAL}
            onClick={async () => {
              await (customerId ? selectedQuery.refetch() : customersQuery.refetch());
            }}
          />
          {customerId && (
            <Button
              onClick={() => onChange(null)}
              variant={BUTTON_VARIANTS.NEUTRAL}
              text={CUSTOMER_PICKER_COPY.REPLACE}
            />
          )}
        </>
      )}
    </Card>
  );
};

export default ProjectCustomerPickerCard;
