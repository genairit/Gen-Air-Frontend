import Card from "../Card/Card";
import { Box } from "@mui/material";
import Button from "../Button/Button";
import TextField from "../TextField/TextField";
import CardHeader from "../CardHeader/CardHeader";
import { Fragment, type FC, useState } from "react";
import { usePageStyles } from "../../pages/page.style";
import LoadingState from "../LoadingState/LoadingState";
import { ICON_NAMES } from "../../constants/icon.constant";
import { BUTTON_VARIANTS } from "../Button/constants/button.constants";
import { FIELD_TYPES } from "../TextField/constants/textfield.constants";
import type { ICustomerContact } from "../../interfaces/customer-contact.interface";
import { useContactDirectorySearch } from "../../hooks/queries/contact-directory.query";
import { CONTACT_DIRECTORY_SEARCH_COPY } from "../../constants/contact-directory-search.constant";
import ContactDirectorySearchError from "../ContactDirectorySearchError/ContactDirectorySearchError";

interface IDirectoryContactPickerProps {
  title: string;
  subtitle: string;
  disabled?: boolean;
  embedded?: boolean;
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
  embedded = false,
}) => {
  const Wrapper = embedded ? Fragment : Card;
  const styles = usePageStyles();
  const [search, setSearch] = useState("");
  const showSearch = selected.length === 0 || multiple;
  const directoryQuery = useContactDirectorySearch({
    search,
    enabled: !disabled && showSearch,
  });
  const available = directoryQuery.contacts.filter(
    contact => !selected.some(item => item.id === contact.id),
  );

  const showEmpty = directoryQuery.isReady && !directoryQuery.isLoading && available.length === 0;

  return (
    <Wrapper>
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
      {showSearch && (
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
          {directoryQuery.showPrompt && (
            <Box role="status">{CONTACT_DIRECTORY_SEARCH_COPY.PROMPT}</Box>
          )}
          {directoryQuery.isLoading && (
            <LoadingState label={CONTACT_DIRECTORY_SEARCH_COPY.LOADING} />
          )}
          {directoryQuery.errorMessage && (
            <ContactDirectorySearchError
              busy={directoryQuery.isLoading}
              onRetry={directoryQuery.refresh}
              message={directoryQuery.errorMessage}
            />
          )}
          {showEmpty && <Box role="status">{CONTACT_DIRECTORY_SEARCH_COPY.EMPTY}</Box>}
          {available.map(contact => (
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
    </Wrapper>
  );
};

export default DirectoryContactPicker;
