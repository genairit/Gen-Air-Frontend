import type { FC } from "react";
import SelectField from "../../../components/SelectField/SelectField";
import { isEstimateScope } from "../../../utilities/engineering-estimate.utility";
import { ESTIMATE_SCOPE_OPTIONS } from "../../../constants/engineering-estimate.constant";
import type { EstimateScopeType } from "../../../interfaces/engineering-estimate.interface";

interface IEstimateScopeFieldProps {
  busy: boolean;
  value: EstimateScopeType;
  onChange: (scope: EstimateScopeType) => void;
}

const EstimateScopeField: FC<IEstimateScopeFieldProps> = ({ busy, value, onChange }) => {
  return (
    <SelectField
      value={value}
      disabled={busy}
      title="היקף עבודה"
      ariaLabel="היקף עבודה"
      items={ESTIMATE_SCOPE_OPTIONS}
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
