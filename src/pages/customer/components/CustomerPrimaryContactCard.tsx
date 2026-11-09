import { Box } from "@mui/material";
import { type FC, useState } from "react";
import Card from "../../../components/Card/Card";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { useSessionUser } from "../../../store/session.store";
import { queryClient } from "../../../providers/query-client";
import TextField from "../../../components/TextField/TextField";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { toTelephoneHref } from "../../../utilities/phone.utility";
import { QUERY_KEYS } from "../../../constants/query-key.constant";
import { customerService } from "../../../services/customer.service";
import { PERMISSIONS } from "../../../constants/permission.constant";
import InlineError from "../../../components/InlineError/InlineError";
import { hasPermission } from "../../../utilities/permission.utility";
import type { IApiCustomer } from "../../../interfaces/api.interface";
import { useDebouncedValue } from "../../../hooks/debounced-value.hook";
import { SEARCH_DEBOUNCE_MS } from "../../../constants/search.constant";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { toCustomerContactDraft } from "../../../utilities/customer-contact.utility";
import { contactDirectoryService } from "../../../services/contact-directory.service";
import { createPrimaryContactAction } from "../../../actions/contact-directory.action";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import CustomerContactEditor from "../../../components/CustomerContacts/CustomerContactEditor";

interface ICustomerPrimaryContactCardProps {
  customer: IApiCustomer;
}

const CustomerPrimaryContactCard: FC<ICustomerPrimaryContactCardProps> = ({ customer }) => {
  const styles = usePageStyles();
  const user = useSessionUser();
  const canEdit = hasPermission(user, PERMISSIONS.CUSTOMERS_UPDATE);
  const [search, setSearch] = useState("");
  const [isSelecting, setIsSelecting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState(toCustomerContactDraft(null));
  const [createdContactId, setCreatedContactId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const directoryQuery = useQuery({
    enabled: isSelecting && canEdit,
    queryKey: ["contact-directory", debouncedSearch],
    queryFn: () => contactDirectoryService.search(debouncedSearch),
  });
  const setPrimaryMutation = useMutation({
    mutationFn: (contactId: string | null) =>
      customerService.setPrimaryContact(customer.id, contactId),
    onSuccess: updated => {
      queryClient.setQueryData(QUERY_KEYS.customer(customer.id), updated);
      setIsSelecting(false);
      setIsCreating(false);
    },
  });
  const createMutation = useMutation({
    mutationFn: () =>
      createPrimaryContactAction({
        draft,
        customerId: customer.id,
        createdContactId,
        onContactCreated: setCreatedContactId,
      }),
    onSuccess: updated => {
      queryClient.setQueryData(QUERY_KEYS.customer(customer.id), updated);
      setIsCreating(false);
      setIsSelecting(false);
      setCreatedContactId(null);
    },
  });
  const primary =
    customer.primaryContact ??
    customer.contacts?.find(contact => contact.id === customer.primaryContactId);

  return (
    <Card gap="18px" padding="24px">
      <CardHeader
        title="איש קשר של הלקוח"
        icon={ICON_NAMES.CONTACTS}
        subtitle="איש קשר אחד לכל היותר; הבחירה נשמרת במדריך וניתנת לשימוש בפרויקטים אחרים."
      />
      {primary ? (
        <Box sx={styles.spacedRow}>
          <Box component="b" sx={styles.wrappingText}>
            {primary.name}
          </Box>
          {primary.phone && (
            <Box
              dir="ltr"
              component="a"
              sx={styles.wrappingText}
              href={toTelephoneHref(primary.phone)}
            >
              {primary.phone}
            </Box>
          )}
          {primary.email && (
            <Box dir="ltr" component="span" sx={styles.wrappingText}>
              {primary.email}
            </Box>
          )}
        </Box>
      ) : (
        <Box role="status">לא הוגדר איש קשר ללקוח</Box>
      )}
      {canEdit && !isSelecting && !isCreating && (
        <Box sx={styles.row({ gap: "8px" })}>
          <Button
            text="בחר מהמדריך"
            variant={BUTTON_VARIANTS.NEUTRAL}
            onClick={() => setIsSelecting(true)}
          />
          <Button
            text="צור איש קשר"
            variant={BUTTON_VARIANTS.NEUTRAL}
            onClick={() => {
              setCreatedContactId(null);
              setIsCreating(true);
            }}
          />
          {primary && (
            <Button
              text="הסר שיוך ללקוח"
              variant={BUTTON_VARIANTS.NEUTRAL}
              onClick={() => setPrimaryMutation.mutate(null)}
            />
          )}
        </Box>
      )}
      {isSelecting && (
        <Box sx={styles.stack({ gap: "12px" })}>
          <TextField
            value={search}
            onChange={setSearch}
            title="חיפוש במדריך"
            type={FIELD_TYPES.SEARCH}
            placeholder="שם, טלפון או דוא״ל"
          />
          {directoryQuery.isPending && <LoadingState label="מחפש אנשי קשר" />}
          {directoryQuery.isError && (
            <InlineError message={getApiErrorMessage(directoryQuery.error)} />
          )}
          {(directoryQuery.data ?? []).map(contact => (
            <Box key={contact.id} sx={styles.spacedRow}>
              {contact.name} · {contact.phone ?? contact.email ?? ""}
              <Button
                text="בחר"
                variant={BUTTON_VARIANTS.NEUTRAL}
                onClick={() => setPrimaryMutation.mutate(contact.id)}
              />
            </Box>
          ))}
          <Button
            text="ביטול"
            variant={BUTTON_VARIANTS.NEUTRAL}
            onClick={() => setIsSelecting(false)}
          />
        </Box>
      )}
      {isCreating && (
        <CustomerContactEditor
          values={draft}
          onChange={setDraft}
          busy={createMutation.isPending}
          onSave={() => createMutation.mutate()}
          error={createMutation.isError ? getApiErrorMessage(createMutation.error) : null}
          onCancel={() => {
            setCreatedContactId(null);
            setIsCreating(false);
          }}
        />
      )}
      {setPrimaryMutation.isError && (
        <InlineError message={getApiErrorMessage(setPrimaryMutation.error)} />
      )}
    </Card>
  );
};

export default CustomerPrimaryContactCard;
