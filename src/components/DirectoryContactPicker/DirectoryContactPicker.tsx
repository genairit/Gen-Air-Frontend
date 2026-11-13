import Card from "../Card/Card";
import { Box } from "@mui/material";
import Button from "../Button/Button";
import { type FC, useState } from "react";
import TextField from "../TextField/TextField";
import { useQuery } from "@tanstack/react-query";
import CardHeader from "../CardHeader/CardHeader";
import InlineError from "../InlineError/InlineError";
import { usePageStyles } from "../../pages/page.style";
import LoadingState from "../LoadingState/LoadingState";
import { ICON_NAMES } from "../../constants/icon.constant";
import { SEARCH_DEBOUNCE_MS } from "../../constants/search.constant";
import { useDebouncedValue } from "../../hooks/debounced-value.hook";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { BUTTON_VARIANTS } from "../Button/constants/button.constants";
import { FIELD_TYPES } from "../TextField/constants/textfield.constants";
import { contactDirectoryService } from "../../services/contact-directory.service";
import type { ICustomerContact } from "../../interfaces/customer-contact.interface";

interface IDirectoryContactPickerProps {
  title: string;
  subtitle: string;
  disabled?: boolean;
  multiple?: boolean;
  selected: ICustomerContact[];
  onChange: (contacts: ICustomerContact[]) => void;
}

const DirectoryContactPicker: FC<IDirectoryContactPickerProps> = ({
  title,
  subtitle,
  selected,
  onChange,
  disabled = false,
  multiple = false,
}) => {
  const styles = usePageStyles();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const directoryQuery = useQuery({
    enabled: debouncedSearch.trim().length > 0,
    queryKey: ["contact-directory", debouncedSearch],
    queryFn: () => contactDirectoryService.search(debouncedSearch),
  });
  const available = (directoryQuery.data ?? []).filter(
    contact => !selected.some(item => item.id === contact.id),
  );

  return (
    <Card gap="18px">
      <CardHeader title={title} subtitle={subtitle} icon={ICON_NAMES.CONTACTS} />
      {selected.map(contact => (
        <Box key={contact.id} sx={styles.spacedRow}>
          <Box>
            {contact.name} · {contact.phone ?? contact.email ?? ""}
            {multiple && selected[0]?.id === contact.id && " · איש קשר ראשי של הפרויקט"}
          </Box>
          {multiple && selected[0]?.id !== contact.id && (
            <Button
              disabled={disabled}
              variant={BUTTON_VARIANTS.NEUTRAL}
              text={`קבע את ${contact.name} כראשי`}
              onClick={() =>
                onChange([contact, ...selected.filter(item => item.id !== contact.id)])
              }
            />
          )}
          <Button
            text="הסר בחירה"
            disabled={disabled}
            variant={BUTTON_VARIANTS.NEUTRAL}
            onClick={() => onChange(selected.filter(item => item.id !== contact.id))}
          />
        </Box>
      ))}
      {(!selected.length || multiple) && (
        <>
          <TextField
            value={search}
            disabled={disabled}
            onChange={setSearch}
            type={FIELD_TYPES.SEARCH}
            startIcon={ICON_NAMES.SEARCH}
            placeholder="שם, טלפון או דוא״ל"
            title="חיפוש איש קשר קיים במדריך"
          />
          {search && (search !== debouncedSearch || directoryQuery.isPending) && (
            <LoadingState label="מחפש אנשי קשר" />
          )}
          {directoryQuery.isError && (
            <Box sx={styles.stack({ gap: "8px" })}>
              <InlineError message={getApiErrorMessage(directoryQuery.error)} />
              <Button
                text="נסה שוב"
                disabled={disabled}
                variant={BUTTON_VARIANTS.NEUTRAL}
                onClick={async () => {
                  await directoryQuery.refetch();
                }}
              />
            </Box>
          )}
          {search === debouncedSearch && directoryQuery.isSuccess && available.length === 0 && (
            <Box role="status">לא נמצאו אנשי קשר מתאימים</Box>
          )}
          {(search === debouncedSearch ? available : []).map(contact => (
            <Box key={contact.id} sx={styles.spacedRow}>
              <Box>
                {contact.name} · {contact.phone ?? contact.email ?? ""}
              </Box>
              <Button
                disabled={disabled}
                text={`בחר ${contact.name}`}
                variant={BUTTON_VARIANTS.NEUTRAL}
                onClick={() => {
                  onChange([...selected, contact]);
                  setSearch("");
                }}
              />
            </Box>
          ))}
        </>
      )}
    </Card>
  );
};

export default DirectoryContactPicker;
