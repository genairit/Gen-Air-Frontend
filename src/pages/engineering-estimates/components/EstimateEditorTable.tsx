import type {
  IEstimateArea,
  IEstimatePricedLine,
} from "../../../interfaces/engineering-estimate.interface";

import { Box } from "@mui/material";
import { Fragment, type FC } from "react";
import styles from "../estimate-document.module.css";
import Button from "../../../components/Button/Button";
import EstimateCatalogueLine from "./EstimateCatalogueLine";
import TextField from "../../../components/TextField/TextField";
import { newEstimateLine } from "../../../utilities/estimate-draft.utility";
import { CommandIdentityManager } from "../../../managers/command-identity.manager";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";

interface IEstimateEditorTableProps {
  busy: boolean;
  areas: IEstimateArea[];
  lines: IEstimatePricedLine[];
  onChange: (areas: IEstimateArea[]) => void;
}
const EstimateEditorTable: FC<IEstimateEditorTableProps> = ({ busy, areas, lines, onChange }) => {
  const update = (area: IEstimateArea): void =>
    onChange(areas.map(current => (current.id === area.id ? area : current)));
  const addArea = (): void =>
    onChange([
      ...areas,
      { id: CommandIdentityManager.create(), name: "אזור חדש", repeatCount: 1, lines: [] },
    ]);
  const addGeneral = (): void =>
    onChange([
      {
        id: CommandIdentityManager.create(),
        name: "כללי",
        repeatCount: 1,
        lines: [newEstimateLine()],
      },
    ]);
  return (
    <Box component="section" className={styles.editor} aria-label="עריכת פריטים לפי אזור">
      <Box component="table" className={styles.table} aria-label="פריטים מהקטלוג לפי אזור">
        <Box component="thead">
          <Box component="tr">
            <Box scope="col" component="th">
              פריטים מהקטלוג
            </Box>
          </Box>
        </Box>
        <Box component="tbody">
          {areas.map(area => (
            <Fragment key={area.id}>
              <Box component="tr" className={styles.area}>
                <Box component="th" scope="rowgroup">
                  <Box component="div" className={styles.areaFields}>
                    <TextField
                      compact
                      disabled={busy}
                      maxLength={120}
                      value={area.name}
                      type={FIELD_TYPES.TEXT}
                      title="שם אזור או טיפוס"
                      onChange={name => update({ ...area, name })}
                    />
                    <TextField
                      compact
                      disabled={busy}
                      title="מספר חזרות"
                      type={FIELD_TYPES.NUMBER}
                      value={String(area.repeatCount)}
                      onChange={repeats => update({ ...area, repeatCount: Number(repeats) })}
                    />
                  </Box>
                </Box>
              </Box>
              {area.lines.map(line => {
                const priced = lines.find(
                  row => row.areaId === area.id && row.catalogueItemId === line.catalogueItemId,
                );
                const itemLabel = priced
                  ? `${priced.sku} · ${priced.description}`
                  : line.catalogueItemId;
                return (
                  <Box key={line.id} component="tr">
                    <Box component="td">
                      <EstimateCatalogueLine
                        busy={busy}
                        line={line}
                        itemLabel={itemLabel}
                        onRemove={() =>
                          update({
                            ...area,
                            lines: area.lines.filter(current => current.id !== line.id),
                          })
                        }
                        onChange={next =>
                          update({
                            ...area,
                            lines: area.lines.map(current =>
                              current.id === next.id ? next : current,
                            ),
                          })
                        }
                      />
                    </Box>
                  </Box>
                );
              })}
              <Box component="tr">
                <Box component="td">
                  <Button
                    disabled={busy}
                    text="הוספת פריט"
                    variant={BUTTON_VARIANTS.SECONDARY}
                    ariaLabel={`הוספת פריט לאזור ${area.name}`}
                    onClick={() => update({ ...area, lines: [...area.lines, newEstimateLine()] })}
                  />
                </Box>
              </Box>
            </Fragment>
          ))}
        </Box>
      </Box>
      {areas.length === 0 && (
        <Box component="div" className={styles.actions}>
          <Button
            disabled={busy}
            text="הוספת פריט"
            onClick={addGeneral}
            variant={BUTTON_VARIANTS.SECONDARY}
          />
        </Box>
      )}
      <Box component="div" className={styles.actions}>
        <Button
          disabled={busy}
          text="הוספת אזור"
          onClick={addArea}
          variant={BUTTON_VARIANTS.SECONDARY}
        />
      </Box>
    </Box>
  );
};
export default EstimateEditorTable;
