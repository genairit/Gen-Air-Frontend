import type { FC } from "react";
import SelectField from "../../../components/SelectField/SelectField";
import { isEstimateScope } from "../../../utilities/engineering-estimate.utility";
import { ESTIMATE_SCOPE_LABELS } from "../../../constants/engineering-estimate.constant";
import type { EstimateScopeType } from "../../../interfaces/engineering-estimate.interface";

interface IEstimateScopeFieldProps {
  busy: boolean;
  value: EstimateScopeType;
  onChange: (scope: EstimateScopeType) => void;
}

const EstimateScopeField: FC<IEstimateScopeFieldProps> = ({ busy, value, onChange }) => {
  const options = Object.entries(ESTIMATE_SCOPE_LABELS).map(([value, label]) => ({ value, label }));
  return (
    <SelectField
      value={value}
      disabled={busy}
      items={options}
      title="היקף עבודה"
      ariaLabel="היקף עבודה"
      onChange={(event): void => {
        const scope = event.target.value;
        if (isEstimateScope(scope)) {
          onChange(scope);
        }
      }}
    />
  );
};

export default EstimateScopeField;
