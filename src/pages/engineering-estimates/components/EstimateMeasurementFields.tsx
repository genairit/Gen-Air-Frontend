import {
  isEstimateEquipment,
  isEstimateDistribution,
} from "../../../utilities/engineering-estimate.utility";

import {
  ESTIMATE_EQUIPMENT_LABELS,
  ESTIMATE_DISTRIBUTION_LABELS,
} from "../../../constants/engineering-estimate.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import TextField from "../../../components/TextField/TextField";
import EstimateMeasurementNumber from "./EstimateMeasurementNumber";
import SelectField from "../../../components/SelectField/SelectField";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import type { IEstimateMeasurements } from "../../../interfaces/engineering-estimate.interface";

interface IEstimateMeasurementFieldsProps {
  busy: boolean;
  value: IEstimateMeasurements;
  onChange: (value: IEstimateMeasurements) => void;
}

const EstimateMeasurementFields: FC<IEstimateMeasurementFieldsProps> = ({
  busy,
  value,
  onChange,
}) => {
  const styles = usePageStyles();
  const equipmentOptions = Object.entries(ESTIMATE_EQUIPMENT_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
  const distributionOptions = Object.entries(ESTIMATE_DISTRIBUTION_LABELS).map(
    ([value, label]) => ({ value, label }),
  );
  const shelterOptions = [
    { value: "no", label: "ללא" },
    { value: "yes", label: "יש יציאת אספקה בממ״ד" },
  ];
  const { distribution } = value;
  const showDuct = distribution.kind === "duct";
  const ductCode = distribution.catalogueCode ?? "";
  const changeEquipment = (equipment: string): void => {
    if (isEstimateEquipment(equipment)) {
      onChange({ ...value, equipment });
    }
  };
  const changeDistribution = (kind: string): void => {
    if (isEstimateDistribution(kind)) {
      onChange({ ...value, distribution: { kind } });
    }
  };

  return (
    <Box sx={styles.stack({ gap: "8px" })}>
      <SelectField
        disabled={busy}
        value={value.equipment}
        items={equipmentOptions}
        title="סוג ציוד לפי תוכנית"
        ariaLabel="סוג ציוד לפי תוכנית"
        onChange={(event): void => changeEquipment(event.target.value)}
      />
      <EstimateMeasurementNumber
        busy={busy}
        title="צנרת גז במטרים, כולל עלייה"
        initial={value.pipeMetresIncludingRise}
        onChange={(metres): void => onChange({ ...value, pipeMetresIncludingRise: metres })}
      />
      <SelectField
        disabled={busy}
        title="אספקה לממ״ד"
        items={shelterOptions}
        ariaLabel="אספקה לממ״ד"
        value={value.shelterSupply ? "yes" : "no"}
        onChange={(event): void =>
          onChange({ ...value, shelterSupply: event.target.value === "yes" })
        }
      />
      <SelectField
        disabled={busy}
        title="פיזור אוויר"
        ariaLabel="פיזור אוויר"
        value={distribution.kind}
        items={distributionOptions}
        onChange={(event): void => changeDistribution(event.target.value)}
      />
      {showDuct && (
        <>
          <TextField
            disabled={busy}
            value={ductCode}
            type={FIELD_TYPES.TEXT}
            title="מק״ט תעלת פח בקטלוג"
            onChange={(catalogueCode): void =>
              onChange({ ...value, distribution: { ...distribution, catalogueCode } })
            }
          />
          <EstimateMeasurementNumber
            busy={busy}
            title="אורך תעלה במטרים"
            initial={distribution.metres ?? null}
            onChange={(metres): void =>
              onChange({ ...value, distribution: { ...distribution, metres } })
            }
          />
          <EstimateMeasurementNumber
            busy={busy}
            title="מספר כיפופי תעלה"
            initial={distribution.bends ?? null}
            onChange={(bends): void =>
              onChange({ ...value, distribution: { ...distribution, bends } })
            }
          />
        </>
      )}
    </Box>
  );
};

export default EstimateMeasurementFields;
