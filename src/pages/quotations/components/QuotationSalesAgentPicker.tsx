import {
  getOptionLabels,
  findOptionIdByLabel,
  findOptionLabelById,
} from "../../../utilities/option.utility";

import type { FC } from "react";
import styles from "../quotation.module.css";
import Button from "../../../components/Button/Button";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useQuotationSalesAgentsQuery } from "../../../hooks/queries/quotation.query";
import { toQuotationSalesAgentOptions } from "../../../utilities/quotation-presentation.utility";
import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

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
  const agentsQuery = useQuotationSalesAgentsQuery();
  const eligibleAgents = toQuotationSalesAgentOptions(agentsQuery.data ?? []);
  const selectedAgentIsAvailable = eligibleAgents.some(agent => String(agent.id) === value);
  const selectedAgentLabel = selectedName ?? "סוכן שמור";
  const unavailableAgentLabel = agentsQuery.isSuccess
    ? `${selectedAgentLabel} · לא זמין`
    : selectedAgentLabel;
  const preservedAgentOption =
    value !== null && !selectedAgentIsAvailable
      ? [{ id: value, label: unavailableAgentLabel }]
      : [];
  const options = [...preservedAgentOption, ...eligibleAgents];
  const selectedLabel = findOptionLabelById(options, value);

  return (
    <div className={styles.picker}>
      <Autocomplete
        disabled={disabled}
        value={selectedLabel}
        title="סוכן מכירות (אופציונלי)"
        options={getOptionLabels(options)}
        onChange={label => onChange(findOptionIdByLabel(options, label))}
      />
      {agentsQuery.isPending && <span role="status">טוען סוכני מכירות...</span>}
      {!agentsQuery.isPending && !agentsQuery.isError && !eligibleAgents.length && (
        <span role="status">לא נמצאו משתמשים מתאימים</span>
      )}
      {agentsQuery.isError && (
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
