import {
  PROJECT_CONTACT_ROLE_COPY,
  PROJECT_CONTACT_ROLE_LABELS,
} from "../../constants/project-contact-role.constant";

import { Box } from "@mui/material";
import Button from "../Button/Button";
import { type FC, useState } from "react";
import InlineError from "../InlineError/InlineError";
import { usePageStyles } from "../../pages/page.style";
import Autocomplete from "../Autocomplete/Autocomplete";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toTelephoneHref } from "../../utilities/phone.utility";
import { useDebouncedValue } from "../../hooks/debounced-value.hook";
import { SEARCH_DEBOUNCE_MS } from "../../constants/search.constant";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import CustomerContactEditor from "../CustomerContacts/CustomerContactEditor";
import { toCustomerContactDraft } from "../../utilities/customer-contact.utility";
import { saveRoleContactAction } from "../../actions/project-contact-role.action";
import { contactDirectoryService } from "../../services/contact-directory.service";
import type { ICustomerContact } from "../../interfaces/customer-contact.interface";
import { BUTTON_VARIANTS, BUTTON_SIZES } from "../Button/constants/button.constants";
import { contactAutocompleteItem } from "../../utilities/project-contact-role.utility";
import type { ProjectContactRoleType } from "../../constants/project-contact-role.constant";

interface IProjectContactRoleFieldProps {
  canEdit: boolean;
  disabled: boolean;
  canEditDetails: boolean;
  canCreateContact?: boolean;
  role: ProjectContactRoleType;
  contact: ICustomerContact | null;
  onActivityChange?: (active: boolean) => void;
  onSelect: (contact: ICustomerContact | null) => void | Promise<void>;
}

const ProjectContactRoleField: FC<IProjectContactRoleFieldProps> = ({
  role,
  contact,
  canEdit,
  canEditDetails,
  canCreateContact = false,
  disabled,
  onSelect,
  onActivityChange,
}) => {
  const title = PROJECT_CONTACT_ROLE_LABELS[role];
  const styles = usePageStyles();
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState<ICustomerContact | null>(null);
  const [createdContact, setCreatedContact] = useState<ICustomerContact | null>(null);
  const [draft, setDraft] = useState(toCustomerContactDraft(null));
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const hasQuery = search.trim().length > 0;
  const isCurrentQuery = search === debouncedSearch;
  const directoryQuery = useQuery({
    enabled: canEdit && hasQuery && isCurrentQuery,
    queryKey: ["contact-directory", debouncedSearch],
    queryFn: () => contactDirectoryService.search(debouncedSearch),
  });
  const selectMutation = useMutation({
    onMutate: () => onActivityChange?.(true),
    onSettled: () => onActivityChange?.(isEditing),
    mutationFn: async (selected: ICustomerContact | null): Promise<void> => {
      await onSelect(selected);
    },
  });
  const saveMutation = useMutation({
    mutationFn: () =>
      saveRoleContactAction({
        draft,
        existing: editedContact,
        created: createdContact,
        onCreated: setCreatedContact,
        canEditCreated: canEditDetails,
        onSelect,
      }),
    onSuccess: () => {
      setIsEditing(false);
      setCreatedContact(null);
      onActivityChange?.(false);
    },
  });
  const available = isCurrentQuery && hasQuery ? (directoryQuery.data ?? []) : [];
  const options = available.map(contactAutocompleteItem);
  const selectedItem = contact ? contactAutocompleteItem(contact) : null;
  const isBusy = disabled || selectMutation.isPending || saveMutation.isPending;
  const loading = hasQuery && (!isCurrentQuery || directoryQuery.isFetching);
  const error = selectMutation.error ?? saveMutation.error;
  const errorMessage = error ? getApiErrorMessage(error) : null;
  const searchError = directoryQuery.isError ? getApiErrorMessage(directoryQuery.error) : null;
  const editorError = saveMutation.isError ? getApiErrorMessage(saveMutation.error) : null;
  const showCreateAction = canEdit && canCreateContact;
  const showContactActions = canEdit && contact !== null;
  const showContactEditorAction = showContactActions && canEditDetails;
  const freezeCreatedDetails = createdContact !== null && !canEditDetails;
  const showCreatedPendingNotice = isEditing && freezeCreatedDetails;
  const addLabel = `הוסף ${title}`;
  const removeLabel = `הסר מהתפקיד ${title}`;
  const editLabel = `ערוך פרטי ${title}`;
  const startEditor = (selected: ICustomerContact | null) => {
    setEditedContact(selected);
    setCreatedContact(null);
    setDraft(toCustomerContactDraft(selected));
    setIsEditing(true);
    onActivityChange?.(true);
    saveMutation.reset();
  };
  const cancelEditor = () => {
    setIsEditing(false);
    onActivityChange?.(false);
  };
  const selectionDisabled = isBusy || isEditing;
  const selectContact = (id: string | null) => {
    const selected = available.find(item => item.id === id) ?? null;
    selectMutation.mutate(selected);
    setSearch("");
  };
  return (
    <Box sx={styles.stack({ gap: "8px" })}>
      {canEdit ? (
        <Autocomplete
          title={title}
          items={options}
          isClearable={false}
          isLoading={loading}
          onSearch={setSearch}
          onChange={selectContact}
          isClientFiltered={false}
          value={contact?.id ?? null}
          selectedItem={selectedItem}
          disabled={selectionDisabled}
          placeholder={PROJECT_CONTACT_ROLE_COPY.SEARCH}
        />
      ) : (
        <>
          <Box component="b">{title}</Box>
          <Box>{contact?.name ?? PROJECT_CONTACT_ROLE_COPY.EMPTY}</Box>
        </>
      )}
      {contact?.phone && (
        <Box dir="ltr" component="a" sx={styles.wrappingText} href={toTelephoneHref(contact.phone)}>
          {contact.phone}
        </Box>
      )}
      {contact?.email && (
        <Box dir="ltr" component="a" sx={styles.wrappingText} href={`mailto:${contact.email}`}>
          {contact.email}
        </Box>
      )}
      {showContactActions && (
        <Button
          disabled={isBusy}
          text={removeLabel}
          size={BUTTON_SIZES.COMPACT}
          variant={BUTTON_VARIANTS.NEUTRAL}
          onClick={() => selectMutation.mutate(null)}
        />
      )}
      {showContactActions && (
        <Box>הסרה מהתפקיד אינה מוחקת את איש הקשר; הוא עשוי להישאר ברשימת אנשי הקשר הנוספים.</Box>
      )}
      {canEdit && (
        <Box sx={styles.row({ gap: "8px" })}>
          {showCreateAction && (
            <Button
              text={addLabel}
              disabled={isBusy}
              size={BUTTON_SIZES.COMPACT}
              variant={BUTTON_VARIANTS.NEUTRAL}
              onClick={() => startEditor(null)}
            />
          )}
          {showContactEditorAction && (
            <Button
              text={editLabel}
              disabled={isBusy}
              size={BUTTON_SIZES.COMPACT}
              variant={BUTTON_VARIANTS.NEUTRAL}
              onClick={() => startEditor(contact)}
            />
          )}
        </Box>
      )}
      {errorMessage && <InlineError message={errorMessage} />}
      {searchError && <InlineError message={searchError} />}
      {showCreatedPendingNotice && <Box>{PROJECT_CONTACT_ROLE_COPY.CREATED_PENDING}</Box>}
      {isEditing && (
        <>
          {editedContact && <Box>{PROJECT_CONTACT_ROLE_COPY.SHARED_EDIT}</Box>}
          <CustomerContactEditor
            busy={isBusy}
            values={draft}
            onChange={setDraft}
            error={editorError}
            onCancel={cancelEditor}
            onSave={() => saveMutation.mutate()}
            fieldsDisabled={freezeCreatedDetails}
          />
        </>
      )}
    </Box>
  );
};
export default ProjectContactRoleField;
