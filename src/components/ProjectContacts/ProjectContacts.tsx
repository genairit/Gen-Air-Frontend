import type {
  IProjectContactLink,
  IProjectContactInput,
} from "../../interfaces/project-contact.interface";

import type {
  ICustomerContact,
  ICustomerContactDraft,
} from "../../interfaces/customer-contact.interface";

import {
  isProjectContactRole,
  projectRoleContactsFromLinks,
} from "../../utilities/project-contact-role.utility";

import Card from "../Card/Card";
import { Box } from "@mui/material";
import Button from "../Button/Button";
import { type FC, useState } from "react";
import TextField from "../TextField/TextField";
import Pagination from "../Pagination/Pagination";
import CardHeader from "../CardHeader/CardHeader";
import InlineError from "../InlineError/InlineError";
import { usePageStyles } from "../../pages/page.style";
import GenericPopup from "../GenericPopup/GenericPopup";
import LoadingState from "../LoadingState/LoadingState";
import { ICON_NAMES } from "../../constants/icon.constant";
import { useSessionUser } from "../../store/session.store";
import { toTelephoneHref } from "../../utilities/phone.utility";
import { QUERY_ROOTS } from "../../constants/query-key.constant";
import { PERMISSIONS } from "../../constants/permission.constant";
import { hasPermission } from "../../utilities/permission.utility";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { BUTTON_VARIANTS } from "../Button/constants/button.constants";
import { FIELD_TYPES } from "../TextField/constants/textfield.constants";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CustomerContactEditor from "../CustomerContacts/CustomerContactEditor";
import { projectContactService } from "../../services/project-contact.service";
import { saveProjectContactAction } from "../../actions/contact-directory.action";
import { toCustomerContactDraft } from "../../utilities/customer-contact.utility";
import ProjectContactRoleFields from "../ProjectContactRoles/ProjectContactRoleFields";
import { useContactDirectorySearch } from "../../hooks/queries/contact-directory.query";
import type { ProjectContactRoleType } from "../../constants/project-contact-role.constant";
import { CONTACT_DIRECTORY_SEARCH_COPY } from "../../constants/contact-directory-search.constant";
import ContactDirectorySearchError from "../ContactDirectorySearchError/ContactDirectorySearchError";

interface IProjectContactsProps {
  canEdit: boolean;
  projectId: string;
}

const ProjectContacts: FC<IProjectContactsProps> = ({ projectId, canEdit }) => {
  const [isManaging, setIsManaging] = useState(false);
  const [page, setPage] = useState(1);
  const styles = usePageStyles();
  const user = useSessionUser();
  const queryClient = useQueryClient();
  const canEditContactDetails = hasPermission(user, PERMISSIONS.CUSTOMERS_UPDATE);
  const [search, setSearch] = useState("");
  const [editorContact, setEditorContact] = useState<ICustomerContact | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createdContactId, setCreatedContactId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ICustomerContactDraft>(toCustomerContactDraft(null));
  const [roleDrafts, setRoleDrafts] = useState<Record<string, string>>({});
  const linksQuery = useQuery({
    queryKey: ["project-contacts", projectId],
    queryFn: () => projectContactService.list(projectId),
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
      await Promise.all([
        linksQuery.refetch(),
        queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.CONTACT_DIRECTORY] }),
      ]);
    },
  });
  const isMutating = linkMutation.isPending || unlinkMutation.isPending || saveMutation.isPending;
  const searchDisabled = isCreating || isMutating || linksQuery.isPending || linksQuery.isError;
  const directoryQuery = useContactDirectorySearch({ search, enabled: canEdit && !searchDisabled });
  const links = linksQuery.data ?? [];
  const roleContacts = projectRoleContactsFromLinks(links);
  const additionalLinks = links.filter(link => !isProjectContactRole(link.role));
  const pageCount = Math.max(1, Math.ceil(additionalLinks.length / 2));
  const currentPage = Math.min(page, pageCount);
  const visibleLinks = additionalLinks.slice((currentPage - 1) * 2, currentPage * 2);
  const available = directoryQuery.contacts.filter(
    contact => !links.some(link => link.contactId === contact.id),
  );
  const showEmpty = directoryQuery.isReady && !directoryQuery.isLoading && available.length === 0;
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

  const setRoleContact = async (role: ProjectContactRoleType, contact: ICustomerContact | null) => {
    await projectContactService.setRole(projectId, role, contact?.id ?? null);
    await linksQuery.refetch();
  };

  return (
    <Card gap="8px" padding="8px">
      <CardHeader
        title="אנשי קשר בפרויקט או בדירה"
        action={
          canEdit ? (
            <Button
              size="compact"
              text="ניהול אנשי קשר נוספים"
              variant={BUTTON_VARIANTS.NEUTRAL}
              onClick={() => setIsManaging(true)}
            />
          ) : null
        }
      />
      {linksQuery.isPending && <LoadingState label="טוען אנשי קשר" />}
      {linksQuery.isError && <InlineError message={getApiErrorMessage(linksQuery.error)} />}
      <ProjectContactRoleFields
        compact
        canEdit={canEdit}
        contacts={roleContacts}
        onChange={setRoleContact}
        canCreateContact={canEdit}
        canEditDetails={canEditContactDetails}
        disabled={linksQuery.isPending || linksQuery.isError}
      />
      <Box sx={styles.stack({ gap: "8px" })}>
        {visibleLinks.map(link => (
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
          </Box>
        ))}
      </Box>
      {additionalLinks.length > 2 && (
        <Pagination
          page={currentPage}
          onChange={setPage}
          pageCount={pageCount}
          nextLabel="אנשי קשר הבאים"
          previousLabel="אנשי קשר קודמים"
        />
      )}
      <GenericPopup
        maxWidth="md"
        open={isManaging && canEdit}
        title="ניהול אנשי קשר נוספים"
        onClose={() => setIsManaging(false)}
        buttons={{ primary: { text: "סיום", onClick: () => setIsManaging(false) } }}
        content={
          <>
            {additionalLinks.map(link => (
              <Box key={link.contactId} sx={styles.spacedRow}>
                <Box component="b">{link.contact.name}</Box>
                <TextField
                  type={FIELD_TYPES.TEXT}
                  title="תפקיד בפרויקט"
                  value={roleDrafts[link.contactId] ?? link.role ?? ""}
                  onChange={value => updateRole(link.contactId, value)}
                />
                <Button size="compact" text="שמור תפקיד" onClick={() => saveRole(link)} />
                {!link.isPrimary && (
                  <Button size="compact" text="קבע כראשי" onClick={() => setPrimary(link)} />
                )}
                <Button
                  size="compact"
                  text="הסר שיוך כאן"
                  onClick={() => unlinkMutation.mutate(link.contactId)}
                />
                {canEditContactDetails && (
                  <Button
                    size="compact"
                    text="ערוך איש קשר"
                    onClick={() => startEditing(link.contact)}
                  />
                )}
              </Box>
            ))}
            {canEdit && (
              <Box sx={styles.stack({ gap: "12px" })}>
                <TextField
                  value={search}
                  onChange={setSearch}
                  disabled={searchDisabled}
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
          </>
        }
      />
      {linkMutation.isError && <InlineError message={getApiErrorMessage(linkMutation.error)} />}
      {unlinkMutation.isError && <InlineError message={getApiErrorMessage(unlinkMutation.error)} />}
    </Card>
  );
};

export default ProjectContacts;
