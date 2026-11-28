import {
  ESTIMATE_DOCUMENT_PANEL,
  ESTIMATE_DOCUMENT_PANELS,
} from "../../../constants/engineering-estimate.constant";

import type {
  IEstimateArea,
  IEngineeringEstimate,
} from "../../../interfaces/engineering-estimate.interface";

import { Box } from "@mui/material";
import { useState, type FC } from "react";
import Tabs from "../../../components/Tabs/Tabs";
import EstimateDocument from "./EstimateDocument";
import styles from "../estimate-document.module.css";
import Button from "../../../components/Button/Button";
import EstimateEditorTable from "./EstimateEditorTable";
import InlineError from "../../../components/InlineError/InlineError";
import { useEstimatePreview } from "../../../hooks/estimate-preview.hook";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";

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
  const [panel, setPanel] = useState<string>(ESTIMATE_DOCUMENT_PANEL.EDITOR);
  const preview = useEstimatePreview({ areas: estimate.areas, scope: estimate.scope }, canEdit);
  const pricing = canEdit ? preview.data : estimate;
  const editorClass = panel === ESTIMATE_DOCUMENT_PANEL.EDITOR ? "" : styles.hidden;
  const previewClass = panel === ESTIMATE_DOCUMENT_PANEL.PREVIEW ? "" : styles.hidden;
  return (
    <>
      {canEdit && (
        <Box component="div" className={styles.mobileTabs}>
          <Tabs
            activeId={panel}
            onChange={setPanel}
            ariaLabel="עורך ותצוגה מקדימה"
            items={ESTIMATE_DOCUMENT_PANELS}
          />
        </Box>
      )}
      <Box className={canEdit ? styles.layout : styles.single}>
        {canEdit && (
          <Box component="div" className={editorClass}>
            <EstimateEditorTable
              busy={busy}
              onChange={onChange}
              areas={estimate.areas}
              lines={preview.data?.lines ?? estimate.lines}
            />
          </Box>
        )}
        <Box component="div" aria-busy={preview.waiting} className={canEdit ? previewClass : ""}>
          {canEdit && preview.waiting && (
            <Box component="p" role="status">
              מחשב כמויות ומחירים…
            </Box>
          )}
          {canEdit && preview.isError && (
            <>
              <InlineError message={getApiErrorMessage(preview.error)} />
              <Button
                text="חישוב מחדש"
                onClick={async () => {
                  await preview.refetch();
                }}
              />
            </>
          )}
          {pricing && !preview.waiting && (
            <EstimateDocument pricing={pricing} name={estimate.name} areas={estimate.areas} />
          )}
          {!pricing && !preview.waiting && !preview.isError && (
            <Box component="p" role="status">
              השלימו את פרטי האזור והפריטים להצגת החישוב.
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};
export default EstimateQuantities;
