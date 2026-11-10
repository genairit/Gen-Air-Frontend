import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import { useState, type FC } from "react";
import styles from "../quotation.module.css";
import Button from "../../../components/Button/Button";
import QuotationEntityPicker from "./QuotationEntityPicker";
import { useSessionUser } from "../../../store/session.store";
import { PERMISSIONS } from "../../../constants/permission.constant";
import { hasPermission } from "../../../utilities/permission.utility";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useQuotationSalesAgentsQuery } from "../../../hooks/queries/quotation.query";
import { toQuotationSalesAgentChoices } from "../../../utilities/quotation-presentation.utility";

interface IQuotationSalesAgentPickerProps {
  disabled: boolean;
  value: string | null;
  selectedName?: string | null;
  onChange: (salesAgentId: string | null) => void;
}

const QuotationSalesAgentPicker: FC<IQuotationSalesAgentPickerProps> = ({
  value,
  disabled,
  selectedName,
  onChange,
}) => {
  const user = useSessionUser();
  const [search, setSearch] = useState("");
  const canChooseAgent =
    hasPermission(user, PERMISSIONS.EMPLOYEES_READ) &&
    hasPermission(user, PERMISSIONS.QUOTATIONS_READ);
  const agentsQuery = useQuotationSalesAgentsQuery();
  const eligibleAgents = toQuotationSalesAgentChoices(agentsQuery.data ?? []);
  const selectedAgentIsAvailable = eligibleAgents.some(agent => agent.id === value);
  const selectedAgentLabel = selectedName ?? "סוכן שמור";
  const unavailableAgentLabel = agentsQuery.isSuccess
    ? `${selectedAgentLabel} · לא זמין`
    : selectedAgentLabel;
  const preservedAgentOption =
    value !== null && !selectedAgentIsAvailable ? [{ id: value, name: unavailableAgentLabel }] : [];
  const choices = [...preservedAgentOption, ...eligibleAgents];
  const choice = choices.find(agent => agent.id === value) ?? null;
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const options = eligibleAgents.filter(agent =>
    agent.name.toLocaleLowerCase().includes(normalizedSearch),
  );
  const pickerDisabled = disabled || !canChooseAgent;
  const optionsLoading = canChooseAgent && agentsQuery.isPending;

  return (
    <div className={styles.picker}>
      <QuotationEntityPicker
        allowClear
        value={choice}
        options={options}
        onChange={onChange}
        onSearch={setSearch}
        loading={optionsLoading}
        disabled={pickerDisabled}
        label="סוכן מכירות (אופציונלי)"
        placeholder="ללא סוכן · חיפוש סוכן מכירות..."
      />
      {canChooseAgent && agentsQuery.isPending && <span role="status">טוען סוכני מכירות...</span>}
      {canChooseAgent &&
        !agentsQuery.isPending &&
        !agentsQuery.isError &&
        !eligibleAgents.length && <span role="status">לא נמצאו משתמשים מתאימים</span>}
      {canChooseAgent && agentsQuery.isError && (
        <div>
          <span role="alert">{getApiErrorMessage(agentsQuery.error)}</span>
          <Button
            text="נסה שוב"
            size={BUTTON_SIZES.COMPACT}
            variant={BUTTON_VARIANTS.NEUTRAL}
            onClick={async () => {
              await agentsQuery.refetch();
            }}
          />
        </div>
      )}
    </div>
  );
};

export default QuotationSalesAgentPicker;
