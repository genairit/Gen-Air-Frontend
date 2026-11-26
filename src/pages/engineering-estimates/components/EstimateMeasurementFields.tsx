import {
  isEstimateEquipment,
  isEstimateDistribution,
} from "../../../utilities/engineering-estimate.utility";

import {
  ESTIMATE_SHELTER_OPTIONS,
  ESTIMATE_EQUIPMENT_OPTIONS,
  ESTIMATE_DISTRIBUTION_OPTIONS,
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
        title="סוג ציוד לפי תוכנית"
        ariaLabel="סוג ציוד לפי תוכנית"
        items={ESTIMATE_EQUIPMENT_OPTIONS}
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
        ariaLabel="אספקה לממ״ד"
        items={ESTIMATE_SHELTER_OPTIONS}
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
        items={ESTIMATE_DISTRIBUTION_OPTIONS}
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
