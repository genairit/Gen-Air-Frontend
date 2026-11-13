import type {
  IProjectContactLink,
  IProjectContactInput,
} from "../../interfaces/project-contact.interface";

import type {
  ICustomerContact,
  ICustomerContactDraft,
} from "../../interfaces/customer-contact.interface";

import Card from "../Card/Card";
import { Box } from "@mui/material";
import Button from "../Button/Button";
import { type FC, useState } from "react";
import TextField from "../TextField/TextField";
import CardHeader from "../CardHeader/CardHeader";
import InlineError from "../InlineError/InlineError";
import { usePageStyles } from "../../pages/page.style";
import LoadingState from "../LoadingState/LoadingState";
import { ICON_NAMES } from "../../constants/icon.constant";
import { useSessionUser } from "../../store/session.store";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toTelephoneHref } from "../../utilities/phone.utility";
import { PERMISSIONS } from "../../constants/permission.constant";
import { hasPermission } from "../../utilities/permission.utility";
import { useDebouncedValue } from "../../hooks/debounced-value.hook";
import { SEARCH_DEBOUNCE_MS } from "../../constants/search.constant";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { BUTTON_VARIANTS } from "../Button/constants/button.constants";
import { FIELD_TYPES } from "../TextField/constants/textfield.constants";
import CustomerContactEditor from "../CustomerContacts/CustomerContactEditor";
import { projectContactService } from "../../services/project-contact.service";
import { saveProjectContactAction } from "../../actions/contact-directory.action";
import { toCustomerContactDraft } from "../../utilities/customer-contact.utility";
import { contactDirectoryService } from "../../services/contact-directory.service";

interface IProjectContactsProps {
  canEdit: boolean;
  projectId: string;
}

const ProjectContacts: FC<IProjectContactsProps> = ({ projectId, canEdit }) => {
  const styles = usePageStyles();
  const user = useSessionUser();
  const canEditContactDetails = hasPermission(user, PERMISSIONS.CUSTOMERS_UPDATE);
  const [search, setSearch] = useState("");
  const [editorContact, setEditorContact] = useState<ICustomerContact | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createdContactId, setCreatedContactId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ICustomerContactDraft>(toCustomerContactDraft(null));
  const [roleDrafts, setRoleDrafts] = useState<Record<string, string>>({});
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const linksQuery = useQuery({
    queryKey: ["project-contacts", projectId],
    queryFn: () => projectContactService.list(projectId),
  });
  const directoryQuery = useQuery({
    enabled: canEdit,
    queryKey: ["contact-directory", debouncedSearch],
    queryFn: () => contactDirectoryService.search(debouncedSearch),
  });
  const linkMutation = useMutation({
    mutationFn: (input: IProjectContactInput) => projectContactService.link(projectId, input),
    onSuccess: () => linksQuery.refetch(),
  });
  const unlinkMutation = useMutation({
    mutationFn: (contactId: string) => projectContactService.unlink(projectId, contactId),
    onSuccess: () => linksQuery.refetch(),
  });
  const saveMutation = useMutation({
    mutationFn: () =>
      saveProjectContactAction({
        draft,
        projectId,
        contactId: editorContact?.id ?? null,
        createdContactId,
        isFirstContact: (linksQuery.data ?? []).length === 0,
        onContactCreated: setCreatedContactId,
      }),
    onSuccess: async () => {
      setIsCreating(false);
      setEditorContact(null);
      setCreatedContactId(null);
      await Promise.all([linksQuery.refetch(), directoryQuery.refetch()]);
    },
  });
  const links = linksQuery.data ?? [];
  const available = (directoryQuery.data ?? []).filter(
    contact => !links.some(link => link.contactId === contact.id),
  );
  const startEditing = (contact: ICustomerContact | null) => {
    setEditorContact(contact);
    setDraft(toCustomerContactDraft(contact));
    setIsCreating(true);
    setCreatedContactId(null);
    saveMutation.reset();
  };
  const updateRole = (contactId: string, role: string) =>
    setRoleDrafts(current => ({ ...current, [contactId]: role }));
  const saveRole = (link: IProjectContactLink) =>
    linkMutation.mutate({
      contactId: link.contactId,
      role: roleDrafts[link.contactId] ?? link.role,
      isPrimary: link.isPrimary,
    });
  const setPrimary = (link: IProjectContactLink) =>
    linkMutation.mutate({
      contactId: link.contactId,
      role: link.role,
      isPrimary: true,
    });
  const addContact = (contact: ICustomerContact) =>
    linkMutation.mutate({
      contactId: contact.id,
      role: contact.role,
      isPrimary: links.length === 0,
    });

  return (
    <Card gap="18px" padding="24px">
      <CardHeader
        icon={ICON_NAMES.CONTACTS}
        title="אנשי קשר בפרויקט או בדירה"
        subtitle="אנשים משותפים מהמדריך. שיוך או הסרה כאן אינם מוחקים איש קשר מהמדריך."
      />
      {linksQuery.isPending && <LoadingState label="טוען אנשי קשר" />}
      {linksQuery.isError && <InlineError message={getApiErrorMessage(linksQuery.error)} />}
      {linksQuery.isSuccess && links.length === 0 && <Box role="status">לא שויכו אנשי קשר</Box>}
      <Box sx={styles.stack({ gap: "12px" })}>
        {links.map(link => (
          <Box key={link.contactId} sx={styles.stack({ gap: "8px" })}>
            <Box sx={styles.spacedRow}>
              <Box component="b" sx={styles.wrappingText}>
                {link.contact.name} {link.isPrimary ? "· איש קשר ראשי של הפרויקט" : ""}
              </Box>
              {link.contact.phone && (
                <Box dir="ltr" component="a" href={toTelephoneHref(link.contact.phone)}>
                  {link.contact.phone}
                </Box>
              )}
            </Box>
            {link.contact.email && (
              <Box dir="ltr" component="span" sx={styles.wrappingText}>
                {link.contact.email}
              </Box>
            )}
            {canEdit && (
              <Box sx={styles.row({ gap: "8px" })}>
                <TextField
                  maxLength={60}
                  title="תפקיד בפרויקט"
                  type={FIELD_TYPES.TEXT}
                  value={roleDrafts[link.contactId] ?? link.role ?? ""}
                  onChange={value => updateRole(link.contactId, value)}
                />
                <Button
                  text="שמור תפקיד"
                  onClick={() => saveRole(link)}
                  variant={BUTTON_VARIANTS.NEUTRAL}
                />
                {!link.isPrimary && (
                  <Button
                    text="קבע כראשי"
                    onClick={() => setPrimary(link)}
                    variant={BUTTON_VARIANTS.NEUTRAL}
                  />
                )}
                <Button
                  text="הסר שיוך כאן"
                  variant={BUTTON_VARIANTS.NEUTRAL}
                  onClick={() => unlinkMutation.mutate(link.contactId)}
                />
                {canEditContactDetails && (
                  <Button
                    text="ערוך איש קשר"
                    variant={BUTTON_VARIANTS.NEUTRAL}
                    onClick={() => startEditing(link.contact)}
                  />
                )}
              </Box>
            )}
          </Box>
        ))}
      </Box>
      {canEdit && (
        <Box sx={styles.stack({ gap: "12px" })}>
          <TextField
            value={search}
            onChange={setSearch}
            type={FIELD_TYPES.SEARCH}
            startIcon={ICON_NAMES.SEARCH}
            placeholder="שם, טלפון או דוא״ל"
            title="חיפוש איש קשר קיים במדריך"
          />
          {directoryQuery.isPending && <LoadingState label="מחפש אנשי קשר" />}
          {directoryQuery.isError && (
            <InlineError message={getApiErrorMessage(directoryQuery.error)} />
          )}
          {available.map(contact => (
            <Box key={contact.id} sx={styles.spacedRow}>
              <Box sx={styles.wrappingText}>
                {contact.name} · {contact.phone ?? contact.email ?? ""}
              </Box>
              <Button
                text="שייך"
                variant={BUTTON_VARIANTS.NEUTRAL}
                onClick={() => addContact(contact)}
              />
            </Box>
          ))}
          <Button
            icon={ICON_NAMES.ADD}
            text="צור איש קשר במדריך"
            onClick={() => startEditing(null)}
          />
        </Box>
      )}
      {isCreating && canEdit && (
        <CustomerContactEditor
          values={draft}
          onChange={setDraft}
          busy={saveMutation.isPending}
          onSave={() => saveMutation.mutate()}
          onCancel={() => setIsCreating(false)}
          error={saveMutation.isError ? getApiErrorMessage(saveMutation.error) : null}
        />
      )}
      {linkMutation.isError && <InlineError message={getApiErrorMessage(linkMutation.error)} />}
      {unlinkMutation.isError && <InlineError message={getApiErrorMessage(unlinkMutation.error)} />}
    </Card>
  );
};

export default ProjectContacts;
