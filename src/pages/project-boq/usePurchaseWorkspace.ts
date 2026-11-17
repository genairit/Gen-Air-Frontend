import {
  PROJECT_BOQ_COST_PATTERN,
  PROJECT_BOQ_QUANTITY_PATTERN,
} from "../../constants/project-boq.constant";

import {
  PURCHASE_ACTION,
  type TPurchaseAction,
  PURCHASE_RECORD_STATUS,
  type TPurchaseRecordStatus,
} from "../../constants/purchase-record.constant";

import { useState } from "react";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { purchaseRecordService } from "../../services/purchase-record.service";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IPurchaseLine, IPurchaseWorkspace } from "../../interfaces/purchase-record.interface";

export const usePurchaseWorkspace = (
  projectId: string,
  historySearch: string,
  historyCursor: string | null,
) => {
  const queryClient = useQueryClient();
  const queryKey = ["purchase-workspace", projectId, historySearch, historyCursor];
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [unitCosts, setUnitCosts] = useState<Record<string, string>>({});
  const [pendingLineId, setPendingLineId] = useState<string | null>(null);
  const [correctionLineId, setCorrectionLineId] = useState<string | null>(null);
  const [supplierName, setSupplierName] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [onBehalfOf, setOnBehalfOf] = useState("");
  const [exceptionReason, setExceptionReason] = useState("");
  const [notes, setNotes] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [transitionReason, setTransitionReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [commandKey, setCommandKey] = useState(crypto.randomUUID());
  const workspace = useQuery({
    queryKey,
    queryFn: () => purchaseRecordService.workspace(projectId, historySearch, historyCursor),
    enabled: Boolean(projectId),
    placeholderData: keepPreviousData,
  });

  const run = async (action: () => Promise<IPurchaseWorkspace>, onSuccess?: () => void) => {
    setBusy(true);
    setError("");
    try {
      await action();
      await queryClient.invalidateQueries({ queryKey: ["purchase-workspace", projectId] });
      onSuccess?.();
      setCommandKey(crypto.randomUUID());
    } catch (cause) {
      setError(getApiErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  const openOrder = (line: IPurchaseLine) => {
    setPendingLineId(line.id);
    setCorrectionLineId(null);
    setQuantities(current => ({
      ...current,
      [line.id]:
        line.remainingQuantity && Number(line.remainingQuantity) > 0 ? line.remainingQuantity : "1",
    }));
    setCommandKey(crypto.randomUUID());
    setError("");
  };

  const openCorrection = (lineId: string) => {
    setCorrectionLineId(lineId);
    setPendingLineId(null);
    setCommandKey(crypto.randomUUID());
    setError("");
  };

  const selectLine = (line: IPurchaseLine, selected: boolean) => {
    setSelectedIds(current =>
      selected ? [...current, line.id] : current.filter(id => id !== line.id),
    );
    if (selected && !quantities[line.id]) {
      setQuantities(current => ({
        ...current,
        [line.id]:
          line.remainingQuantity && Number(line.remainingQuantity) > 0
            ? line.remainingQuantity
            : "1",
      }));
    }
    setCommandKey(crypto.randomUUID());
  };

  const submit = async (kind: TPurchaseAction) => {
    const ids = pendingLineId ? [pendingLineId] : selectedIds;
    const lines = ids.map(boqLineId => ({
      boqLineId,
      quantity: quantities[boqLineId] ?? "",
      ...(unitCosts[boqLineId] ? { unitCost: unitCosts[boqLineId] } : {}),
    }));
    if (
      lines.length === 0 ||
      lines.some(
        line => !PROJECT_BOQ_QUANTITY_PATTERN.test(line.quantity) || Number(line.quantity) <= 0,
      )
    ) {
      setError("יש לציין כמות חיובית לכל שורה.");
      return;
    }
    if (lines.some(line => line.unitCost && !PROJECT_BOQ_COST_PATTERN.test(line.unitCost))) {
      setError("מחיר יחידה חייב להיות מספר תקין.");
      return;
    }
    if (kind === PURCHASE_ACTION.ORDER && (!supplierName.trim() || !orderDate)) {
      setError("יש לציין ספק ותאריך להזמנה.");
      return;
    }
    const input = {
      idempotencyKey: commandKey,
      lines,
      supplierName: supplierName.trim(),
      onBehalfOf: onBehalfOf.trim(),
      exceptionReason: exceptionReason.trim(),
      notes: notes.trim(),
      ...(orderDate ? { orderDate } : {}),
    };
    await run(
      () =>
        kind === PURCHASE_ACTION.ORDER
          ? purchaseRecordService.order(projectId, input)
          : purchaseRecordService.request(projectId, input),
      () => {
        setPendingLineId(null);
        setSelectedIds([]);
        setExceptionReason("");
        setNotes("");
      },
    );
  };

  const correct = async () => {
    if (!correctionLineId || !correctionReason.trim()) {
      setError("יש לציין סיבה לתיקון ההזמנה.");
      return;
    }
    await run(
      () =>
        purchaseRecordService.correct(
          projectId,
          correctionLineId,
          correctionReason.trim(),
          commandKey,
        ),
      () => {
        setCorrectionLineId(null);
        setCorrectionReason("");
      },
    );
  };

  const transition = async (recordId: string, status: TPurchaseRecordStatus) => {
    const orderDetails =
      status === PURCHASE_RECORD_STATUS.ORDERED
        ? {
            ...(supplierName.trim() ? { supplierName: supplierName.trim() } : {}),
            ...(orderDate ? { orderDate } : {}),
          }
        : {};
    await run(
      () =>
        purchaseRecordService.transition(projectId, recordId, status, {
          idempotencyKey: commandKey,
          reason: transitionReason.trim(),
          ...orderDetails,
        }),
      () => setTransitionReason(""),
    );
  };

  const clearSelection = () => {
    setPendingLineId(null);
    setSelectedIds([]);
  };

  return {
    workspace,
    selectedIds,
    quantities,
    unitCosts,
    pendingLineId,
    correctionLineId,
    supplierName,
    orderDate,
    onBehalfOf,
    exceptionReason,
    notes,
    correctionReason,
    transitionReason,
    busy,
    error,
    setQuantities,
    setUnitCosts,
    setSupplierName,
    setOrderDate,
    setOnBehalfOf,
    setExceptionReason,
    setNotes,
    setCorrectionReason,
    setTransitionReason,
    setPendingLineId,
    setCorrectionLineId,
    openOrder,
    openCorrection,
    selectLine,
    submit,
    correct,
    transition,
    clearSelection,
  };
};
