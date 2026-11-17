import {
  matchesPurchaseLine,
  getPurchaseLineStatus,
  getPurchaseSourceLabel,
  formatPurchaseQuantity,
  getPurchaseQuantityNote,
} from "../../utilities/purchase-record.utility";

import {
  hasPurchaseOverrun,
  canCancelPurchaseRecord,
} from "../../utilities/purchase-record.utility";

import {
  PURCHASE_ACTION,
  PURCHASE_ALL_CATEGORY,
  PURCHASE_RECORD_LABELS,
  PURCHASE_RECORD_STATUS,
  PURCHASE_RECORD_NEXT_STATUS,
} from "../../constants/purchase-record.constant";

import { useRef, useState } from "react";
import BoqLineEditor from "./BoqLineEditor";
import Tabs from "../../components/Tabs/Tabs";
import Card from "../../components/Card/Card";
import { Box, Typography } from "@mui/material";
import Button from "../../components/Button/Button";
import CheckBox from "../../components/CheckBox/CheckBox";
import { useSessionUser } from "../../store/session.store";
import TextField from "../../components/TextField/TextField";
import { usePurchaseWorkspace } from "./usePurchaseWorkspace";
import { PERMISSIONS } from "../../constants/permission.constant";
import InlineError from "../../components/InlineError/InlineError";
import { hasPermission } from "../../utilities/permission.utility";
import LoadingState from "../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { TAB_MODES, TABS_VARIANTS } from "../../constants/tabs.constant";
import type { IBoqLineEdit } from "../../interfaces/project-boq.interface";
import { purchaseWorkspaceStyles as styles } from "./purchase-workspace.style";
import { BUTTON_VARIANTS } from "../../components/Button/constants/button.constants";
import { FIELD_TYPES } from "../../components/TextField/constants/textfield.constants";

interface IPurchaseWorkspaceProps {
  projectId: string;
  boqRevision: number;
  canManageBoq: boolean;
  onUpdateBoqLine: (lineId: string, edit: IBoqLineEdit) => Promise<void>;
}

const PurchaseWorkspace = ({
  projectId,
  boqRevision,
  canManageBoq,
  onUpdateBoqLine,
}: IPurchaseWorkspaceProps) => {
  const user = useSessionUser();
  const [historySearch, setHistorySearch] = useState("");
  const [historyCursor, setHistoryCursor] = useState<string | null>(null);
  const [historyCursors, setHistoryCursors] = useState<(string | null)[]>([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const reviewHeadingRef = useRef<HTMLHeadingElement>(null);
  const state = usePurchaseWorkspace(projectId, historySearch, historyCursor);
  const canRequest = hasPermission(user, PERMISSIONS.PURCHASE_REQUESTS_REVIEW);
  const canOrder = hasPermission(user, PERMISSIONS.PURCHASE_ORDERS_APPROVE);
  const data = state.workspace.data;
  const categories = [...new Set(data?.lines.map(line => line.materialCategory) ?? [])];
  const activeCategory =
    category === PURCHASE_ALL_CATEGORY || categories.includes(category)
      ? category
      : (categories[0] ?? PURCHASE_ALL_CATEGORY);
  const categoryItems = [
    ...categories.map(name => ({
      id: name,
      label: name,
      count: data?.lines.filter(line => line.materialCategory === name).length ?? 0,
    })),
    { id: PURCHASE_ALL_CATEGORY, label: "הכול", count: data?.lines.length ?? 0 },
  ];
  const visibleLines = (data?.lines ?? []).filter(line =>
    matchesPurchaseLine(line, activeCategory, search),
  );
  const selectedLines = (data?.lines ?? []).filter(line => state.selectedIds.includes(line.id));
  const inputLines = state.pendingLineId
    ? (data?.lines ?? []).filter(line => line.id === state.pendingLineId)
    : selectedLines;
  const visibleHistory = data?.history ?? [];

  if (state.workspace.isPending) {
    return <LoadingState />;
  }
  if (state.workspace.error || !data) {
    return <InlineError message={getApiErrorMessage(state.workspace.error)} />;
  }

  return (
    <Box dir="rtl" sx={styles.stack}>
      <Card>
        <Box sx={styles.header}>
          <Box>
            <Typography component="h2" sx={styles.heading}>
              רכש לפרויקט
            </Typography>
            <Typography variant="body2">
              בקשות שומרות כמות זמינה. הזמנה נרשמת רק באישור; אין שליחת ספק או קליטת מחסן בשלב זה.
            </Typography>
          </Box>
          <Typography variant="body2">
            {data.lines.length} חומרים · {data.history.length} פעולות
          </Typography>
        </Box>
        <TextField
          value={search}
          title="חיפוש חומר"
          type={FIELD_TYPES.SEARCH}
          placeholder="שם, דגם או קוד"
          onChange={value => {
            setSearch(value);
            if (value) setCategory(PURCHASE_ALL_CATEGORY);
          }}
        />
        <Box sx={styles.tabScroller}>
          <Tabs
            isScrollable
            items={categoryItems}
            mode={TAB_MODES.TABS}
            onChange={setCategory}
            activeId={activeCategory}
            ariaLabel="קטגוריות חומרים"
            variant={TABS_VARIANTS.PILLS}
          />
        </Box>
        {selectedLines.length > 0 && !state.pendingLineId && (
          <Box sx={styles.selectionBar}>
            <Typography role="status">נבחרו {selectedLines.length} חומרים</Typography>
            <Button
              text="לרכש קבוצתי"
              variant={BUTTON_VARIANTS.SECONDARY}
              onClick={() => {
                reviewHeadingRef.current?.focus();
                reviewHeadingRef.current?.scrollIntoView({ block: "center" });
              }}
            />
            <Button
              text="נקה בחירה"
              onClick={state.clearSelection}
              variant={BUTTON_VARIANTS.NEUTRAL}
            />
          </Box>
        )}
        {(inputLines.length > 0 || state.correctionLineId) && (
          <Box sx={styles.reviewPanel}>
            {state.correctionLineId ? (
              <>
                <Typography component="h3" sx={styles.heading}>
                  תיקון סימון ״הוזמן״
                </Typography>
                <Typography variant="body2">
                  הפעולה תחזיר את כל הכמות המוזמנת הפעילה בשורה לזמינה. היסטוריית ההזמנות תישמר.
                </Typography>
                <TextField
                  isRequired
                  title="סיבת התיקון"
                  type={FIELD_TYPES.TEXT}
                  value={state.correctionReason}
                  onChange={state.setCorrectionReason}
                />
                <Box sx={styles.actions}>
                  <Button
                    text="שמור תיקון"
                    isLoading={state.busy}
                    onClick={state.correct}
                    variant={BUTTON_VARIANTS.DANGER}
                    disabled={state.busy || !state.correctionReason.trim()}
                  />
                  <Button
                    text="ביטול"
                    variant={BUTTON_VARIANTS.NEUTRAL}
                    onClick={() => state.setCorrectionLineId(null)}
                  />
                </Box>
              </>
            ) : (
              <>
                <Typography tabIndex={-1} component="h3" sx={styles.heading} ref={reviewHeadingRef}>
                  {state.pendingLineId
                    ? "רישום הזמנה לחומר"
                    : `רכש קבוצתי · ${selectedLines.length} שורות`}
                </Typography>
                {!state.pendingLineId && (
                  <Typography variant="body2">
                    {selectedLines.map(line => line.materialName).join(" · ")}
                  </Typography>
                )}
                <Box sx={styles.formGrid}>
                  <TextField
                    title="ספק"
                    type={FIELD_TYPES.TEXT}
                    value={state.supplierName}
                    onChange={state.setSupplierName}
                  />
                  <TextField
                    title="תאריך הזמנה"
                    type={FIELD_TYPES.DATE}
                    value={state.orderDate}
                    onChange={state.setOrderDate}
                  />
                  <TextField
                    type={FIELD_TYPES.TEXT}
                    value={state.onBehalfOf}
                    title="עבור מי התבקשה הכמות"
                    onChange={state.setOnBehalfOf}
                  />
                  <TextField
                    type={FIELD_TYPES.TEXT}
                    value={state.exceptionReason}
                    title="סיבת חריגה מהכמות המתוכננת"
                    onChange={state.setExceptionReason}
                  />
                </Box>
                {inputLines.map(line => (
                  <Box key={line.id} sx={styles.quantityEditor}>
                    <Typography>
                      {line.materialName} · זמין {formatPurchaseQuantity(line.remainingQuantity)}{" "}
                      {line.materialUnit}
                    </Typography>
                    <TextField
                      type={FIELD_TYPES.NUMBER}
                      title={`כמות ${line.materialName}`}
                      value={state.quantities[line.id] ?? ""}
                      onChange={value =>
                        state.setQuantities(current => ({ ...current, [line.id]: value }))
                      }
                    />
                    <TextField
                      type={FIELD_TYPES.NUMBER}
                      value={state.unitCosts[line.id] ?? ""}
                      title={`מחיר קנייה ליחידה ₪ · ${line.materialName} (אם ידוע)`}
                      onChange={value =>
                        state.setUnitCosts(current => ({ ...current, [line.id]: value }))
                      }
                    />
                  </Box>
                ))}
                <TextField
                  title="הערות"
                  value={state.notes}
                  type={FIELD_TYPES.TEXT}
                  onChange={state.setNotes}
                />
                <Box sx={styles.actions}>
                  {canRequest && !state.pendingLineId && (
                    <Button
                      disabled={state.busy}
                      isLoading={state.busy}
                      text="שמור בקשה ושמור כמות"
                      variant={BUTTON_VARIANTS.SECONDARY}
                      onClick={() => state.submit(PURCHASE_ACTION.REQUEST)}
                    />
                  )}
                  {canOrder && (
                    <Button
                      text="רשום כהוזמן"
                      disabled={state.busy}
                      isLoading={state.busy}
                      onClick={() => state.submit(PURCHASE_ACTION.ORDER)}
                    />
                  )}
                  <Button
                    text="ביטול"
                    onClick={state.clearSelection}
                    variant={BUTTON_VARIANTS.NEUTRAL}
                  />
                </Box>
              </>
            )}
            {state.error && <InlineError message={state.error} />}
          </Box>
        )}

        {data.lines.length === 0 && <Typography>אין עדיין כתב רכש לפרויקט.</Typography>}
        {data.lines.length > 0 && visibleLines.length === 0 && (
          <Typography>לא נמצאו חומרים בקטגוריה או בחיפוש.</Typography>
        )}
        <Box
          role="tabpanel"
          sx={styles.lines}
          aria-label={`חומרים בקטגוריה ${activeCategory === PURCHASE_ALL_CATEGORY ? "הכול" : activeCategory}`}
        >
          {visibleLines.map(line => (
            <Box key={line.id} sx={styles.line}>
              <Box sx={styles.lineTitle}>
                <Typography sx={styles.materialName}>{line.materialName}</Typography>
                <Typography dir="ltr" variant="caption">
                  {line.materialCode}
                </Typography>
                <Typography variant="body2">{getPurchaseLineStatus(line)}</Typography>
                {getPurchaseQuantityNote(line) && (
                  <Typography variant="caption" color="warning.main">
                    {getPurchaseQuantityNote(line)}
                  </Typography>
                )}
              </Box>
              <Box sx={styles.quantities}>
                <Typography>
                  נדרש{" "}
                  <Box dir="ltr" component="strong">
                    {formatPurchaseQuantity(line.requiredQuantity)}
                  </Box>{" "}
                  {line.materialUnit}
                </Typography>
                <Typography>
                  שמור לבקשות{" "}
                  <Box dir="ltr" component="strong">
                    {formatPurchaseQuantity(line.requestedQuantity)}
                  </Box>
                </Typography>
                <Typography>
                  הוזמן{" "}
                  <Box dir="ltr" component="strong">
                    {formatPurchaseQuantity(line.orderedQuantity)}
                  </Box>
                </Typography>
                <Typography>
                  זמין{" "}
                  <Box dir="ltr" component="strong">
                    {formatPurchaseQuantity(line.remainingQuantity)}
                  </Box>
                </Typography>
                {hasPurchaseOverrun(line) && (
                  <Typography color="warning.main">
                    חריגה {formatPurchaseQuantity(line.overrunQuantity)}
                  </Typography>
                )}
              </Box>
              <Box sx={styles.lineActions}>
                <CheckBox
                  text="הוזמן"
                  value={line.ordered}
                  disabled={!canOrder || state.busy || line.requiredQuantity === null}
                  ariaLabel={`${line.materialName}: ${line.ordered ? "סמן לא הוזמן ותעד תיקון" : "סמן הוזמן"}`}
                  onChange={checked =>
                    checked ? state.openOrder(line) : state.openCorrection(line.id)
                  }
                />
                <CheckBox
                  text="בחר"
                  value={state.selectedIds.includes(line.id)}
                  onChange={checked => state.selectLine(line, checked)}
                  ariaLabel={`בחר ${line.materialName} לבקשה או הזמנה קבוצתית`}
                  disabled={!canRequest || state.busy || line.requiredQuantity === null}
                />
              </Box>
              <Box component="details" sx={styles.details}>
                <Box component="summary">מפרט ומקור כמות</Box>
                <Typography variant="body2">
                  {line.systemTitle} · {line.componentTitle}
                </Typography>
                <Typography variant="body2">
                  {line.materialSpecification || "אין מפרט נוסף"} · מקור:{" "}
                  {getPurchaseSourceLabel(line)}
                </Typography>
                <Typography variant="body2">
                  כמות מקור: {formatPurchaseQuantity(line.proposedQuantity)} {line.materialUnit} ·
                  עלות משוערת ליחידה:{" "}
                  {line.estimatedUnitCost === null
                    ? "לא הוזנה"
                    : `₪${formatPurchaseQuantity(line.estimatedUnitCost)}`}
                </Typography>
                {line.notes && <Typography variant="body2">הערה: {line.notes}</Typography>}
                {canManageBoq && (
                  <Box sx={styles.editorScroll}>
                    <BoqLineEditor
                      line={line}
                      revision={boqRevision}
                      canManage={canManageBoq}
                      onSave={onUpdateBoqLine}
                      key={`${line.id}:${boqRevision}`}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Card>

      <Card>
        <Typography component="h2" sx={styles.heading}>
          היסטוריית בקשות והזמנות
        </Typography>
        {state.workspace.isFetching && (
          <Typography role="status" variant="body2">
            מעדכן היסטוריה…
          </Typography>
        )}
        <TextField
          value={historySearch}
          title="חיפוש בהיסטוריה"
          type={FIELD_TYPES.SEARCH}
          placeholder="ספק, חומר, מבקש או הערה"
          onChange={value => {
            setHistorySearch(value);
            setHistoryCursor(null);
            setHistoryCursors([]);
          }}
        />
        {!state.workspace.isFetching && data.history.length === 0 && (
          <Typography>
            {historySearch ? "לא נמצאו פעולות בחיפוש." : "אין עדיין בקשות או הזמנות."}
          </Typography>
        )}
        <Box sx={styles.historyList} aria-busy={state.workspace.isFetching}>
          {visibleHistory.map(record => (
            <Box key={record.id} component="article" sx={styles.historyItem}>
              <Box sx={styles.header}>
                <Typography sx={styles.materialName}>
                  {PURCHASE_RECORD_LABELS[record.status]} · {record.supplierName || "ספק טרם נקבע"}
                </Typography>
                <Typography dir="ltr" variant="caption">
                  {record.orderDate || new Date(record.createdAt).toLocaleDateString("he-IL")}
                </Typography>
              </Box>
              <Typography variant="body2">
                {record.lines
                  .map(
                    line =>
                      `${line.materialName}: ${formatPurchaseQuantity(line.activeQuantity)} ${line.materialUnit}${line.unitCost ? ` · ₪${formatPurchaseQuantity(line.unitCost)} ליחידה` : ""}`,
                  )
                  .join(" · ")}
              </Typography>
              {record.onBehalfOf && (
                <Typography variant="body2">לבקשת: {record.onBehalfOf}</Typography>
              )}
              {record.exceptionReason && (
                <Typography variant="body2">חריגה מאושרת: {record.exceptionReason}</Typography>
              )}
              <Box component="details" sx={styles.details}>
                <Box component="summary">פעולות ותיקונים</Box>
                {record.events.map(event => (
                  <Typography key={event.id} variant="body2">
                    {new Date(event.createdAt).toLocaleString("he-IL")} ·{" "}
                    {PURCHASE_RECORD_LABELS[event.nextStatus] ?? event.nextStatus} · משתמש{" "}
                    {event.actorId}
                    {event.reason ? ` · ${event.reason}` : ""}
                  </Typography>
                ))}
              </Box>
              {canRequest && record.status !== PURCHASE_RECORD_STATUS.CANCELLED && (
                <Box sx={styles.actions}>
                  {PURCHASE_RECORD_NEXT_STATUS[record.status] && (
                    <Button
                      variant={BUTTON_VARIANTS.SECONDARY}
                      text={`העבר ל${PURCHASE_RECORD_LABELS[PURCHASE_RECORD_NEXT_STATUS[record.status]!]}`}
                      disabled={
                        state.busy ||
                        (PURCHASE_RECORD_NEXT_STATUS[record.status] ===
                          PURCHASE_RECORD_STATUS.ORDERED &&
                          !canOrder)
                      }
                      onClick={() => {
                        const next = PURCHASE_RECORD_NEXT_STATUS[record.status];
                        if (next) state.transition(record.id, next);
                      }}
                    />
                  )}
                  {canCancelPurchaseRecord(record.status, canRequest, canOrder) && (
                    <Button
                      text="בטל בקשה/הזמנה"
                      variant={BUTTON_VARIANTS.DANGER}
                      disabled={state.busy || !state.transitionReason.trim()}
                      onClick={() => state.transition(record.id, PURCHASE_RECORD_STATUS.CANCELLED)}
                    />
                  )}
                </Box>
              )}
            </Box>
          ))}
        </Box>
        {(data.nextCursor || historyCursors.length > 0) && (
          <Box sx={styles.actions}>
            {historyCursors.length > 0 && (
              <Button
                text="חדשות יותר"
                variant={BUTTON_VARIANTS.NEUTRAL}
                onClick={() => {
                  const previous = historyCursors.at(-1) ?? null;
                  setHistoryCursor(previous);
                  setHistoryCursors(current => current.slice(0, -1));
                }}
              />
            )}
            {data.nextCursor && (
              <Button
                text="ישנות יותר"
                variant={BUTTON_VARIANTS.NEUTRAL}
                onClick={() => {
                  setHistoryCursors(current => [...current, historyCursor]);
                  setHistoryCursor(data.nextCursor);
                }}
              />
            )}
          </Box>
        )}
        {visibleHistory.some(record => record.status === PURCHASE_RECORD_STATUS.APPROVED) &&
          canOrder && (
            <Box sx={styles.formGrid}>
              <TextField
                type={FIELD_TYPES.TEXT}
                title="ספק להזמנה מאושרת"
                value={state.supplierName}
                onChange={state.setSupplierName}
              />
              <TextField
                type={FIELD_TYPES.DATE}
                value={state.orderDate}
                title="תאריך הזמנה מאושרת"
                onChange={state.setOrderDate}
              />
            </Box>
          )}
        {data.history.length > 0 && canRequest && (
          <TextField
            type={FIELD_TYPES.TEXT}
            value={state.transitionReason}
            title="סיבה לביטול או שינוי מצב"
            onChange={state.setTransitionReason}
          />
        )}
        {state.error && inputLines.length === 0 && !state.correctionLineId && (
          <InlineError message={state.error} />
        )}
      </Card>
    </Box>
  );
};

export default PurchaseWorkspace;
