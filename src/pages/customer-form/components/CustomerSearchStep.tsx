import { Box } from "@mui/material";
import { type FC, useState } from "react";
import Card from "../../../components/Card/Card";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import TextField from "../../../components/TextField/TextField";
import InlineError from "../../../components/InlineError/InlineError";
import type { IApiCustomer } from "../../../interfaces/api.interface";
import { SEARCH_DEBOUNCE_MS } from "../../../constants/search.constant";
import { useDebouncedValue } from "../../../hooks/debounced-value.hook";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { useCustomersQuery } from "../../../hooks/queries/customer.query";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";

interface ICustomerSearchStepProps {
  onCreate: () => void;
  onSelect: (customerId: string) => void;
}

const CustomerSearchStep: FC<ICustomerSearchStepProps> = ({ onCreate, onSelect }) => {
  const styles = usePageStyles();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const customersQuery = useCustomersQuery({ search: debouncedSearch, prioritySyncStatus: null });
  const customers = customersQuery.data ?? [];
  const noResults = customersQuery.isSuccess && customers.length === 0;
  const select = (customer: IApiCustomer) => onSelect(customer.id);

  return (
    <Card gap="18px" padding="24px">
      <Box component="h2">חיפוש לקוח קיים</Box>
      <TextField
        autoFocus
        value={search}
        onChange={setSearch}
        placeholder="חיפוש לקוח"
        type={FIELD_TYPES.SEARCH}
        startIcon={ICON_NAMES.SEARCH}
        title="שם, מספר מזהה או טלפון"
      />
      {customersQuery.isPending && <LoadingState label="מחפש לקוחות" />}
      {customersQuery.isError && (
        <Box sx={styles.stack({ gap: "12px" })}>
          <InlineError message={getApiErrorMessage(customersQuery.error)} />
          <Button
            text="נסה שוב"
            variant={BUTTON_VARIANTS.NEUTRAL}
            onClick={async () => {
              await customersQuery.refetch();
            }}
          />
        </Box>
      )}
      <Box role="listbox" aria-label="לקוחות קיימים" sx={styles.stack({ gap: "8px" })}>
        {customers.map(customer => (
          <Button
            key={customer.id}
            onClick={() => select(customer)}
            variant={BUTTON_VARIANTS.NEUTRAL}
            text={`${customer.name} · ${customer.taxId} · ${customer.phone ?? ""}`}
          />
        ))}
      </Box>
      {noResults && <Box role="status">לא נמצאו לקוחות מתאימים</Box>}
      <Box sx={styles.endRow}>
        <Button onClick={onCreate} text="צור לקוח חדש" icon={ICON_NAMES.ADD} />
      </Box>
    </Card>
  );
};

export default CustomerSearchStep;
