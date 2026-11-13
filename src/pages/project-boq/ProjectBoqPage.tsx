import {
  PROJECT_BOQ_REVIEW,
  PROJECT_BOQ_COST_PATTERN,
  PROJECT_BOQ_QUANTITY_PATTERN,
} from "../../constants/project-boq.constant";

import { useState } from "react";
import BoqLineEditor from "./BoqLineEditor";
import { useParams } from "react-router-dom";
import Card from "../../components/Card/Card";
import { usePageStyles } from "../page.style";
import Button from "../../components/Button/Button";
import { useSessionUser } from "../../store/session.store";
import TextField from "../../components/TextField/TextField";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, MenuItem, Select, Typography } from "@mui/material";
import { PERMISSIONS } from "../../constants/permission.constant";
import InlineError from "../../components/InlineError/InlineError";
import { hasPermission } from "../../utilities/permission.utility";
import { useProjectQuery } from "../../hooks/queries/project.query";
import Autocomplete from "../../components/Autocomplete/Autocomplete";
import LoadingState from "../../components/LoadingState/LoadingState";
import { projectBoqService } from "../../services/project-boq.service";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { FIELD_TYPES } from "../../components/TextField/constants/textfield.constants";
import type { IBoqLine, IBoqLineEdit, IBoqPreview } from "../../interfaces/project-boq.interface";

const ProjectBoqPage = () => {
  const { projectId = "" } = useParams();
  const styles = usePageStyles();
  const canManage = hasPermission(useSessionUser(), PERMISSIONS.PROJECT_BOQ_MANAGE);
  const queryClient = useQueryClient();
  const key = ["project-boq", projectId];
  const project = useProjectQuery(projectId);
  const boq = useQuery({
    queryKey: key,
    queryFn: () => projectBoqService.get(projectId),
    enabled: projectId.length > 0,
  });
  const sources = useQuery({
    queryKey: ["project-boq-sources", projectId],
    queryFn: () => projectBoqService.sources(projectId),
    enabled: projectId.length > 0,
  });
  const [sourceId, setSourceId] = useState("");
  const [preview, setPreview] = useState<IBoqPreview | null>(null);
  const [historyRevision, setHistoryRevision] = useState(0);
  const history = useQuery({
    queryKey: ["project-boq-revision", projectId, historyRevision],
    queryFn: () => projectBoqService.revision(projectId, historyRevision),
    enabled: historyRevision > 0,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [materialSearch, setMaterialSearch] = useState("");
  const materials = useQuery({
    queryKey: ["project-boq-materials", materialSearch],
    queryFn: () => projectBoqService.materials(materialSearch),
    enabled: canManage,
  });
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [systemTitle, setSystemTitle] = useState("");
  const [componentTitle, setComponentTitle] = useState("");
  const [quantity, setQuantity] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  const current = boq.data;
  const update = async (lineId: string, edit: IBoqLineEdit) => {
    const updated = await projectBoqService.updateLine(projectId, lineId, edit);
    queryClient.setQueryData(key, updated);
    setPreview(null);
  };
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (cause) {
      setError(getApiErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  const loadPreview = () =>
    run(async () => {
      setPreview(await projectBoqService.preview(projectId, sourceId));
    });
  const generate = () =>
    run(async () => {
      if (!preview || !current) return;
      const updated = await projectBoqService.generate(projectId, preview, current.revision);
      queryClient.setQueryData(key, updated);
      setPreview(null);
    });
  const addMaterial = () =>
    run(async () => {
      if (!current) return;
      const material = materials.data?.find(
        item => `${item.code} · ${item.name}` === selectedMaterial,
      );
      if (!material) return;
      const updated = await projectBoqService.addLine(projectId, {
        expectedRevision: current.revision,
        materialId: material.id,
        systemTitle,
        componentTitle,
        requiredQuantity: quantity,
        estimatedUnitCost: cost || null,
        reviewState: PROJECT_BOQ_REVIEW.CONFIRMED,
        notes,
      });
      queryClient.setQueryData(key, updated);
      setPreview(null);
      setSelectedMaterial("");
      setQuantity("");
      setCost("");
      setNotes("");
    });
  if (boq.isPending || project.isPending) return <LoadingState />;
  if (boq.error || project.error || !current)
    return <InlineError message={getApiErrorMessage(boq.error ?? project.error)} />;
  const groups = current.lines.reduce<Record<string, IBoqLine[]>>((result, line) => {
    const group = `${line.systemTitle} · ${line.componentTitle}`;
    return { ...result, [group]: [...(result[group] ?? []), line] };
  }, {});
  return (
    <Box sx={styles.page}>
      <Box sx={styles.header}>
        <Box sx={styles.headerText}>
          <Typography component="h1" sx={styles.heading}>
            כתב רכש · {project.data?.name}
          </Typography>
          <Typography sx={styles.description}>
            כמויות חומר נדרשות ועלות קנייה משוערת. גרסה {current.revision}.
          </Typography>
        </Box>
      </Box>
      <Box sx={styles.grid({ minColumnWidth: 220 })}>
        <Card>
          <Typography sx={{ fontWeight: 700 }}>מקור התכנון</Typography>
          <Typography>
            {current.sourceQuotationNumber
              ? `הצעה ${current.sourceQuotationNumber} · גרסה ${current.sourceQuotationVersion}`
              : "טרם נבחרה הצעה"}
          </Typography>
        </Card>
        <Card>
          <Typography sx={{ fontWeight: 700 }}>עלות משוערת חלקית</Typography>
          <Typography>₪{Number(current.estimatedTotal).toLocaleString("he-IL")}</Typography>
          <Typography variant="caption">
            {current.missingCostCount} שורות ללא עלות; {current.unresolvedCount} שורות דורשות בדיקה
          </Typography>
        </Card>
        <Card>
          <Typography sx={{ fontWeight: 700 }}>בקשות והזמנות</Typography>
          <Typography>לא זמין עדיין</Typography>
          <Typography variant="caption">
            כמות מבוקשת, מוזמנת ויתרה יהיו זמינות עם יומן הרכש.
          </Typography>
        </Card>
      </Box>
      {canManage && (
        <Card>
          <Typography component="h2" sx={{ fontWeight: 700 }}>
            הפקת כתב רכש מהצעה מאושרת
          </Typography>
          <Typography variant="body2">
            בחרו הצעה אחת המקושרת לפרויקט. דירות אינן מצורפות אוטומטית.
          </Typography>
          <Box sx={styles.row({ gap: "12px" })}>
            <Select
              size="small"
              displayEmpty
              value={sourceId}
              sx={{ minWidth: 260 }}
              inputProps={{ "aria-label": "בחר הצעת מחיר מאושרת" }}
              onChange={event => {
                setSourceId(event.target.value);
                setPreview(null);
              }}
            >
              <MenuItem value="">בחר הצעה מאושרת</MenuItem>
              {(sources.data ?? []).map(source => (
                <MenuItem key={source.id} value={source.id}>
                  {source.number} · גרסה {source.version}
                </MenuItem>
              ))}
            </Select>
            <Button
              isLoading={busy}
              text="הצג שינויים"
              onClick={loadPreview}
              disabled={!sourceId || busy}
            />
          </Box>
          {sources.isSuccess && sources.data.length === 0 && (
            <Typography>אין הצעה מאושרת המקושרת ישירות לפרויקט.</Typography>
          )}
          {preview && (
            <Box sx={styles.stack({ gap: "8px" })}>
              <Typography sx={{ fontWeight: 700 }}>
                תצוגת שינויים: {preview.added.length} נוספו · {preview.changed.length} השתנו ·{" "}
                {preview.removed.length} יוסרו
              </Typography>
              <Typography>
                {preview.lines.length} שורות חומר מוצעות · {preview.includedCount} חומרים כלולים
                בפריט אחר
              </Typography>
              {preview.added.map(key => {
                const line = preview.lines.find(candidate => candidate.sourceKey === key);
                return (
                  <Typography key={`added:${key}`}>
                    נוסף: {line?.materialName ?? key} · {line?.requiredQuantity ?? "כמות לבדיקה"}{" "}
                    {line?.materialUnit}
                  </Typography>
                );
              })}
              {preview.changed.map(key => {
                const line = preview.lines.find(candidate => candidate.sourceKey === key);
                return (
                  <Typography key={`changed:${key}`}>
                    השתנה: {line?.materialName ?? key} · {line?.requiredQuantity ?? "כמות לבדיקה"}{" "}
                    {line?.materialUnit}
                  </Typography>
                );
              })}
              {preview.removed.map(key => {
                const line = current.lines.find(candidate => candidate.sourceKey === key);
                return (
                  <Typography key={`removed:${key}`}>
                    יוסר: {line?.materialName ?? key} · {line?.requiredQuantity ?? "ללא כמות"}{" "}
                    {line?.materialUnit}
                  </Typography>
                );
              })}
              {preview.unmappedCatalogueItems.length > 0 && (
                <Typography color="warning.main">
                  פריטי קטלוג ללא פירוט חומרים: {preview.unmappedCatalogueItems.join(", ")}
                </Typography>
              )}
              {preview.removed.length > 0 && (
                <Typography color="warning.main">
                  שורות שהוסרו יישמרו בהיסטוריית הגרסאות.
                </Typography>
              )}
              <Button
                disabled={busy}
                isLoading={busy}
                onClick={generate}
                text={current.revision ? "עדכן כתב רכש" : "צור כתב רכש"}
              />
            </Box>
          )}
        </Card>
      )}
      {error && <InlineError message={error} />}
      <Box sx={styles.stack({ gap: "16px" })}>
        <Typography component="h2" sx={{ fontWeight: 700 }}>
          חומרים נדרשים
        </Typography>
        {current.lines.length === 0 && (
          <Typography>אין עדיין שורות. בחרו הצעה מאושרת ליצירת כתב רכש.</Typography>
        )}
        {Object.entries(groups).map(([group, lines]) => (
          <Card key={group}>
            <Typography component="h3" sx={{ fontWeight: 700 }}>
              {group}
            </Typography>
            <Box sx={{ overflowX: "auto" }}>
              {lines?.map(line => (
                <BoqLineEditor
                  line={line}
                  onSave={update}
                  canManage={canManage}
                  revision={current.revision}
                  key={`${line.id}:${current.revision}`}
                />
              ))}
            </Box>
          </Card>
        ))}
      </Box>
      {canManage && current.revision > 0 && (
        <Card>
          <Typography component="h2" sx={{ fontWeight: 700 }}>
            הוסף חומר מאושר
          </Typography>
          <Box sx={styles.grid({ minColumnWidth: 190, gap: "12px" })}>
            <Autocomplete
              title="חומר"
              value={selectedMaterial}
              onSearch={setMaterialSearch}
              onChange={value => setSelectedMaterial(value ?? "")}
              options={(materials.data ?? []).map(item => `${item.code} · ${item.name}`)}
            />
            <TextField
              title="מערכת"
              value={systemTitle}
              type={FIELD_TYPES.TEXT}
              onChange={setSystemTitle}
            />
            <TextField
              title="רכיב"
              value={componentTitle}
              type={FIELD_TYPES.TEXT}
              onChange={setComponentTitle}
            />
            <TextField
              value={quantity}
              title="כמות נדרשת"
              onChange={setQuantity}
              type={FIELD_TYPES.NUMBER}
            />
            <TextField
              value={cost}
              onChange={setCost}
              type={FIELD_TYPES.NUMBER}
              title="עלות יחידה משוערת ₪"
            />
            <TextField title="הערה" value={notes} onChange={setNotes} type={FIELD_TYPES.TEXT} />
          </Box>
          <Button
            text="הוסף חומר"
            isLoading={busy}
            onClick={addMaterial}
            disabled={
              !selectedMaterial ||
              !systemTitle.trim() ||
              !componentTitle.trim() ||
              !PROJECT_BOQ_QUANTITY_PATTERN.test(quantity) ||
              (cost !== "" && !PROJECT_BOQ_COST_PATTERN.test(cost)) ||
              busy
            }
          />
        </Card>
      )}
      {current.revision > 0 && (
        <Card>
          <Typography component="h2" sx={{ fontWeight: 700 }}>
            גרסאות כתב הרכש
          </Typography>
          <Select
            size="small"
            displayEmpty
            sx={{ maxWidth: 220 }}
            value={historyRevision}
            inputProps={{ "aria-label": "בחר גרסה קודמת" }}
            onChange={event => setHistoryRevision(Number(event.target.value))}
          >
            <MenuItem value={0}>בחר גרסה לצפייה</MenuItem>
            {Array.from({ length: current.revision }, (_, index) => index + 1)
              .reverse()
              .map(revision => (
                <MenuItem key={revision} value={revision}>
                  גרסה {revision}
                </MenuItem>
              ))}
          </Select>
          {history.isFetching && <LoadingState />}
          {history.error && <InlineError message={getApiErrorMessage(history.error)} />}
          {history.data && (
            <Box sx={{ overflowX: "auto" }}>
              <Typography variant="caption">
                תיעוד מ־{new Date(history.data.createdAt).toLocaleString("he-IL")} ·{" "}
                {history.data.lines.length} שורות
              </Typography>
              {history.data.lines.map(line => (
                <Typography key={line.id}>
                  {line.systemTitle} · {line.componentTitle} · {line.materialCode} ·{" "}
                  {line.requiredQuantity ?? "לא נקבע"} {line.materialUnit} ·{" "}
                  {line.estimatedUnitCost ?? "אין עלות"} ₪ ליחידה
                </Typography>
              ))}
            </Box>
          )}
        </Card>
      )}
    </Box>
  );
};
export default ProjectBoqPage;
