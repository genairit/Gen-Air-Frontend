import type {
  IEstimateArea,
  IEstimateInputLine,
  IEstimatePricedLine,
  IEngineeringEstimate,
} from "../../../interfaces/engineering-estimate.interface";

import { useState, type FC } from "react";
import { Box, Typography } from "@mui/material";
import { usePageStyles } from "../../page.style";
import EstimateAreaUpdate from "./EstimateAreaUpdate";
import EstimateAreaEditor from "./EstimateAreaEditor";
import Button from "../../../components/Button/Button";
import EstimateCatalogueLine from "./EstimateCatalogueLine";
import DataTable from "../../../components/DataTable/DataTable";
import SelectField from "../../../components/SelectField/SelectField";
import { quotationMoney } from "../../../utilities/quotation.utility";
import type { IDataTableColumn } from "../../../interfaces/data-table.interface";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

interface IEstimateQuantitiesProps {
  busy: boolean;
  canEdit: boolean;
  estimate: IEngineeringEstimate;
  onChange: (areas: IEstimateArea[]) => void;
}

const EstimateQuantities: FC<IEstimateQuantitiesProps> = ({
  busy,
  canEdit,
  estimate,
  onChange,
}) => {
  const styles = usePageStyles();
  const [areaId, setAreaId] = useState("");
  const [lineId, setLineId] = useState("");
  const areas = estimate.areas;
  const selectedArea = areas.find(area => area.id === areaId) ?? areas[0] ?? null;
  const selectedAreaId = selectedArea?.id ?? "";
  const inputLines = selectedArea?.lines ?? [];
  const selectedLine = inputLines.find(line => line.id === lineId);
  const matchingPrice = estimate.lines.find(
    line =>
      line.areaId === selectedAreaId && line.catalogueItemId === selectedLine?.catalogueItemId,
  );
  const selectedLineLabel = matchingPrice?.description ?? selectedLine?.catalogueItemId;
  const items = areas.map(area => ({ value: area.id, label: area.name }));
  const updateArea = (area: IEstimateArea): void => {
    onChange(areas.map(current => (current.id === area.id ? area : current)));
  };
  const saveLine = (line: IEstimateInputLine): void => {
    if (!selectedArea) {
      return;
    }

    const nextLines = selectedLine
      ? inputLines.map(input => (input.id === selectedLine.id ? line : input))
      : [...inputLines, line];
    updateArea({ ...selectedArea, lines: nextLines });
  };
  const removeLine = (): void => {
    if (!selectedArea || !selectedLine) {
      return;
    }

    updateArea({ ...selectedArea, lines: inputLines.filter(line => line.id !== selectedLine.id) });
  };
  const chooseArea = (id: string): void => {
    setAreaId(id);
    setLineId("");
  };
  const lineOptions = [
    { value: "", label: "פריט חדש" },
    ...inputLines.map((line, index) => {
      const pricedLine = estimate.lines.find(
        price => price.areaId === selectedAreaId && price.catalogueItemId === line.catalogueItemId,
      );
      const label = pricedLine
        ? `${pricedLine.description} · שורה ${index + 1}`
        : `שורה ${index + 1}`;
      return { value: line.id, label };
    }),
  ];
  const formKey = selectedLine?.id ?? selectedAreaId;
  const editorProps =
    selectedLine && selectedLineLabel
      ? { initial: selectedLine, itemLabel: selectedLineLabel }
      : {};

  return (
    <Box sx={styles.stack({ gap: "12px" })}>
      {areas.map((area): React.JSX.Element => {
        const rows = estimate.lines
          .filter(line => line.areaId === area.id)
          .map((line, index) => ({ ...line, rowId: String(index) }));
        return (
          <Box key={area.id} sx={styles.stack({ gap: "8px" })}>
            <Typography component="h3">
              {area.name} · {area.repeatCount} חזרות
            </Typography>
            <DataTable
              rows={rows}
              columns={ESTIMATE_COLUMNS}
              getRowId={(line): string => line.rowId}
              endAdornment={rows.length === 0 && <Typography>אין פריטים באזור הזה.</Typography>}
            />
          </Box>
        );
      })}
      <Typography component="strong">
        סה״כ לפני מע״מ · {quotationMoney(estimate.subtotal)}
      </Typography>
      {canEdit && (
        <Box sx={styles.grid({ minColumnWidth: 250 })}>
          <EstimateAreaEditor busy={busy} areas={areas} onChange={onChange} />
          {selectedArea && (
            <Box sx={styles.stack({ gap: "12px" })}>
              <SelectField
                items={items}
                disabled={busy}
                title="אזור לעריכה"
                value={selectedAreaId}
                ariaLabel="אזור לעריכה"
                onChange={(event): void => chooseArea(event.target.value)}
              />
              <EstimateAreaUpdate
                busy={busy}
                area={selectedArea}
                key={selectedArea.id}
                onChange={updateArea}
              />
              <SelectField
                disabled={busy}
                items={lineOptions}
                title="פריט לעריכה"
                ariaLabel="פריט לעריכה"
                value={selectedLine?.id ?? ""}
                onChange={(event): void => setLineId(event.target.value)}
              />
              <EstimateCatalogueLine busy={busy} key={formKey} onSave={saveLine} {...editorProps} />
              {selectedLine && (
                <Button
                  disabled={busy}
                  text="הסרת פריט"
                  onClick={removeLine}
                  variant={BUTTON_VARIANTS.DANGER}
                />
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

const ESTIMATE_COLUMNS: IDataTableColumn<IEstimatePricedLine>[] = [
  { id: "sku", header: "מק״ט", track: "minmax(115px, 0.7fr)", render: (line): string => line.sku },
  {
    id: "description",
    header: "פריט",
    track: "minmax(200px, 1fr)",
    render: (line): string => line.description,
  },
  {
    id: "source",
    header: "מקור",
    track: "minmax(90px, 0.6fr)",
    render: (line): string => line.provenance ?? (line.source === "rule" ? "לפי כלל" : "ידני"),
  },
  {
    id: "quantity",
    header: "כמות כוללת",
    track: "minmax(125px, 0.7fr)",
    render: (line): string => `${line.quantity} ${line.unit}`,
  },
  {
    id: "unitPrice",
    header: "מחיר יחידה",
    track: "minmax(115px, 0.7fr)",
    render: (line): string =>
      line.unitPrice === null ? "חסר מחיר" : quotationMoney(line.unitPrice),
  },
  {
    id: "total",
    header: "סה״כ",
    track: "minmax(115px, 0.7fr)",
    render: (line): string => (line.total === null ? "—" : quotationMoney(line.total)),
  },
];

export default EstimateQuantities;
