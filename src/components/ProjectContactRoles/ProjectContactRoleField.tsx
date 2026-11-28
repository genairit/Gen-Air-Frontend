import {
  PROJECT_CONTACT_ROLE_COPY,
  PROJECT_CONTACT_ROLE_LABELS,
} from "../../constants/project-contact-role.constant";

import { Box } from "@mui/material";
import Button from "../Button/Button";
import { type FC, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import InlineError from "../InlineError/InlineError";
import { usePageStyles } from "../../pages/page.style";
import GenericPopup from "../GenericPopup/GenericPopup";
import Autocomplete from "../Autocomplete/Autocomplete";
import { toTelephoneHref } from "../../utilities/phone.utility";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import CustomerContactEditor from "../CustomerContacts/CustomerContactEditor";
import { toCustomerContactDraft } from "../../utilities/customer-contact.utility";
import { saveRoleContactAction } from "../../actions/project-contact-role.action";
import type { ICustomerContact } from "../../interfaces/customer-contact.interface";
import { BUTTON_VARIANTS, BUTTON_SIZES } from "../Button/constants/button.constants";
import { contactAutocompleteItem } from "../../utilities/project-contact-role.utility";
import { useContactDirectorySearch } from "../../hooks/queries/contact-directory.query";
import type { ProjectContactRoleType } from "../../constants/project-contact-role.constant";
import { CONTACT_DIRECTORY_SEARCH_COPY } from "../../constants/contact-directory-search.constant";
import ContactDirectorySearchError from "../ContactDirectorySearchError/ContactDirectorySearchError";

interface IProjectContactRoleFieldProps {
  canEdit: boolean;
  compact?: boolean;
  disabled: boolean;
  canEditDetails: boolean;
  canCreateContact?: boolean;
  role: ProjectContactRoleType;
  contact: ICustomerContact | null;
  onActivityChange?: (active: boolean) => void;
  onSelect: (contact: ICustomerContact | null) => void | Promise<void>;
}

const ProjectContactRoleField: FC<IProjectContactRoleFieldProps> = ({
  compact = false,
  role,
  contact,
  canEdit,
  canEditDetails,
  canCreateContact = false,
  disabled,
  onSelect,
  onActivityChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const title = PROJECT_CONTACT_ROLE_LABELS[role];
  const styles = usePageStyles();
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState<ICustomerContact | null>(null);
  const [createdContact, setCreatedContact] = useState<ICustomerContact | null>(null);
  const [draft, setDraft] = useState(toCustomerContactDraft(null));
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
  const isBusy = disabled || selectMutation.isPending || saveMutation.isPending;
  const selectionDisabled = isBusy || isEditing;
  const directoryQuery = useContactDirectorySearch({
    search,
    enabled: canEdit && !selectionDisabled,
  });
  const available = directoryQuery.contacts;
  const options = available.map(contactAutocompleteItem);
  const selectedItem = contact ? contactAutocompleteItem(contact) : null;
  const noOptionsText = directoryQuery.showPrompt
    ? CONTACT_DIRECTORY_SEARCH_COPY.PROMPT
    : CONTACT_DIRECTORY_SEARCH_COPY.EMPTY;
  const searchFeedback = directoryQuery.errorMessage ? (
    <ContactDirectorySearchError
      busy={directoryQuery.isLoading}
      onRetry={directoryQuery.refresh}
      message={directoryQuery.errorMessage}
    />
  ) : null;
  const error = selectMutation.error ?? saveMutation.error;
  const errorMessage = error ? getApiErrorMessage(error) : null;
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
  const selectContact = (id: string | null) => {
    const selected = available.find(item => item.id === id) ?? null;
    if (!selected || selectionDisabled) {
      return;
    }

    selectMutation.mutate(selected);
    setSearch("");
  };
  if (compact)
    return (
      <Box sx={styles.stack({ gap: "4px" })}>
        <Box sx={styles.spacedRow}>
          <Box sx={styles.row({ gap: "8px" })}>
            <Box component="b">{title}</Box>
            <Box>{contact?.name ?? "לא שויך"}</Box>
          </Box>
          {canEdit && (
            <Button
              size="compact"
              disabled={disabled}
              onClick={() => setIsOpen(true)}
              variant={BUTTON_VARIANTS.NEUTRAL}
              text={contact ? `ערוך ${title}` : `שייך ${title}`}
            />
          )}
        </Box>
        <Box sx={styles.row({ gap: "8px" })}>
          {contact?.phone && (
            <Box dir="ltr" component="a" href={toTelephoneHref(contact.phone)}>
              {contact.phone}
            </Box>
          )}
          {contact?.email && (
            <Box dir="ltr" component="a" sx={styles.wrappingText} href={`mailto:${contact.email}`}>
              {contact.email}
            </Box>
          )}
        </Box>
        <GenericPopup
          open={isOpen}
          title={title}
          maxWidth="sm"
          onClose={() => setIsOpen(false)}
          buttons={{ primary: { text: "סיום", onClick: () => setIsOpen(false) } }}
          content={
            <ProjectContactRoleField
              role={role}
              contact={contact}
              canEdit={canEdit}
              disabled={disabled}
              canEditDetails={canEditDetails}
              canCreateContact={canCreateContact}
              onSelect={onSelect}
              onActivityChange={onActivityChange}
            />
          }
        />
      </Box>
    );
  return (
    <Box sx={styles.stack({ gap: "8px" })}>
      {canEdit ? (
        <Autocomplete
          title={title}
          items={options}
          isClearable={false}
          onSearch={setSearch}
          onChange={selectContact}
          isClientFiltered={false}
          value={contact?.id ?? null}
          selectedItem={selectedItem}
          disabled={selectionDisabled}
          noOptionsText={noOptionsText}
          emptyFeedback={searchFeedback}
          isLoading={directoryQuery.isLoading}
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
