import {
  matchesPurchaseLine,
  getPurchaseSourceLabel,
  getPurchaseQuantityNote,
} from "../src/utilities/purchase-record.utility";

import type {
  IPurchaseLine,
  IPurchaseHistory,
  IPurchaseWorkspace,
} from "../src/interfaces/purchase-record.interface";

import { test } from "node:test";
import assert from "node:assert/strict";
import Tabs from "../src/components/Tabs/Tabs";
import { act, create } from "react-test-renderer";
import Button from "../src/components/Button/Button";
import { setSession } from "../src/store/session.store";
import CheckBox from "../src/components/CheckBox/CheckBox";
import TextField from "../src/components/TextField/TextField";
import { USER_ROLES } from "../src/constants/user-role.constant";
import { PERMISSIONS } from "../src/constants/permission.constant";
import BoqLineEditor from "../src/pages/project-boq/BoqLineEditor";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PurchaseWorkspace from "../src/pages/project-boq/PurchaseWorkspace";
import { purchaseRecordService } from "../src/services/purchase-record.service";
import { matchingAgreement } from "../src/utilities/supplier-agreement.utility";
import { PURCHASE_RECORD_STATUS } from "../src/constants/purchase-record.constant";
import { usePurchaseWorkspace } from "../src/pages/project-boq/usePurchaseWorkspace";
import type { ISupplierAgreement } from "../src/interfaces/supplier-agreement.interface";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

const line = (id: string, category: string): IPurchaseLine => ({
  id,
  notes: "",
  sourceKey: `source:${id}`,
  materialId: `material:${id}`,
  systemTitle: "מערכת",
  sourceBasis: "manual",
  reviewState: "confirmed",
  materialCode: `MAT-${id}`,
  materialName: `חומר ${id}`,
  materialUnit: "unit",
  displayOrder: 0,
  componentTitle: "רכיב",
  materialCategory: category,
  quantityOverridden: false,
  proposedQuantity: null,
  requiredQuantity: "10",
  estimatedUnitCost: null,
  estimatedLineCost: null,
  materialSpecification: null,
  ordered: false,
  requestedQuantity: "0",
  orderedQuantity: "0",
  remainingQuantity: "10",
  overrunQuantity: "0",
});

const initial: IPurchaseWorkspace = {
  projectId: "project-1",
  revision: 1,
  lines: [line("a", "צנרת"), line("b", "בידוד")],
  history: [],
  nextCursor: null,
};

test("approved request sends selected supplier agreement terms", async () => {
  const originalWorkspace = purchaseRecordService.workspace;
  const originalTransition = purchaseRecordService.transition;
  const record: IPurchaseHistory = {
    id: "request-1",
    status: PURCHASE_RECORD_STATUS.APPROVED,
    notes: "",
    createdAt: "2026-11-17T12:00:00.000Z",
    updatedAt: "2026-11-17T12:00:00.000Z",
    createdById: "user-1",
    updatedById: "user-1",
    orderDate: null,
    onBehalfOf: null,
    supplierId: null,
    supplierName: null,
    supplierContactName: null,
    supplierPhone: null,
    supplierEmail: null,
    exceptionReason: null,
    events: [],
    lines: [
      {
        id: "request-line-1",
        materialId: "material:a",
        quantity: "3",
        activeQuantity: "3",
        materialName: "חומר a",
        materialUnit: "unit",
        boqSourceKey: "source:a",
        currencyCode: "ILS",
        unitCost: null,
        supplierAgreementId: null,
        supplierAgreementVersion: null,
      },
    ],
  };
  const supplierId = "supplier-1";
  const agreement: ISupplierAgreement = {
    id: "agreement-1",
    projectId: "project-1",
    boqSourceKey: "source:a",
    materialId: "material:a",
    materialUnit: "unit",
    supplierId,
    supplierName: "ספק אחד",
    unitPrice: "12.5000",
    currencyCode: "ILS",
    agreedQuantity: "5.00000000",
    effectiveFrom: null,
    effectiveThrough: null,
    active: true,
    version: 2,
    notes: "",
  };
  const calls: unknown[] = [];
  purchaseRecordService.workspace = () => Promise.resolve({ ...initial, history: [record] });
  purchaseRecordService.transition = (_projectId, _recordId, _status, input) => {
    calls.push(input);
    return Promise.resolve({
      ...initial,
      history: [{ ...record, status: PURCHASE_RECORD_STATUS.ORDERED }],
    });
  };
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const holder: { current: ReturnType<typeof usePurchaseWorkspace> | null } = { current: null };
  const Probe = () => {
    holder.current = usePurchaseWorkspace("project-1", "", null);
    return null;
  };
  const rendered: { current: ReturnType<typeof create> | null } = { current: null };
  try {
    await act(async () => {
      rendered.current = create(
        <QueryClientProvider client={client}>
          <Probe />
        </QueryClientProvider>,
      );
    });
    await act(async () => {
      holder.current?.setSupplierId(supplierId);
      holder.current?.setOrderDate("2026-11-17");
    });
    let saved = false;
    await act(async () => {
      saved =
        (await holder.current?.transition(record, PURCHASE_RECORD_STATUS.ORDERED, [agreement])) ??
        false;
    });
    assert.equal(saved, true);
    assert.deepEqual((calls[0] as { supplierId: string; lines: unknown[] }).supplierId, supplierId);
    assert.deepEqual((calls[0] as { lines: unknown[] }).lines, [
      {
        recordLineId: "request-line-1",
        agreementId: "agreement-1",
        agreementVersion: 2,
        unitCost: "12.5000",
      },
    ]);
  } finally {
    purchaseRecordService.workspace = originalWorkspace;
    purchaseRecordService.transition = originalTransition;
    await act(async () => rendered.current?.unmount());
    client.clear();
  }
});

test("quantity indicators distinguish unresolved, estimated and overridden planning", () => {
  assert.equal(
    getPurchaseQuantityNote({ ...initial.lines[0], requiredQuantity: null }),
    "כמות נדרשת טרם נקבעה",
  );
  assert.equal(
    getPurchaseQuantityNote({ ...initial.lines[0], reviewState: "pending" }),
    "כמות ממתינה לאישור",
  );
  assert.equal(
    getPurchaseQuantityNote({ ...initial.lines[0], quantityOverridden: true }),
    "כמות עודכנה ידנית",
  );
  assert.equal(
    getPurchaseQuantityNote({ ...initial.lines[0], sourceBasis: "conditional" }),
    "כמות מותנית בפרויקט",
  );
  assert.equal(
    getPurchaseQuantityNote({ ...initial.lines[0], sourceBasis: "project_measurement" }),
    "כמות לפי מדידת פרויקט",
  );
  assert.equal(getPurchaseQuantityNote(initial.lines[0]), null);
  assert.equal(getPurchaseSourceLabel(initial.lines[0]), "נוסף ידנית");
  assert.equal(
    getPurchaseSourceLabel({ ...initial.lines[0], sourceBasis: "legacy" }),
    "מקור לא מזוהה",
  );
});

test("BOQ editor keeps a draft on unchanged refetch and shows saved cost after same-revision refresh", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  client.setQueryData(["purchase-workspace", "project-1", "", null], initial);
  const rendered: { current: ReturnType<typeof create> | null } = { current: null };
  const editorCost = () =>
    rendered.current?.root
      .findAllByType(BoqLineEditor)[0]
      ?.findAllByType(TextField)
      .find(field => field.props.title === "עלות יחידה משוערת ₪");
  const refreshWorkspace = async (lines: IPurchaseLine[]) => {
    await act(async () => {
      client.setQueryData(["purchase-workspace", "project-1", "", null], {
        ...initial,
        lines,
      });
      await new Promise<void>(resolve => setTimeout(resolve, 0));
    });
  };
  try {
    await act(async () => {
      rendered.current = create(
        <QueryClientProvider client={client}>
          <PurchaseWorkspace
            canManageBoq
            boqRevision={1}
            projectId="project-1"
            onUpdateBoqLine={() => Promise.resolve()}
          />
        </QueryClientProvider>,
      );
    });
    assert.equal(editorCost()?.props.value, "");
    await act(async () => editorCost()?.props.onChange("7"));
    await refreshWorkspace([{ ...initial.lines[0], requestedQuantity: "2" }, initial.lines[1]]);
    assert.equal(editorCost()?.props.value, "7");
    await refreshWorkspace([
      { ...initial.lines[0], estimatedUnitCost: "12.5000" },
      initial.lines[1],
    ]);
    assert.equal(editorCost()?.props.value, "12.5000");
  } finally {
    await act(async () => rendered.current?.unmount());
    client.clear();
  }
});

test("selection survives category changes and submits one shared supplier with partial quantities", async () => {
  const originalWorkspace = purchaseRecordService.workspace;
  const originalOrder = purchaseRecordService.order;
  const calls: { lines: { boqLineId: string; quantity: string }[]; supplierName?: string }[] = [];
  purchaseRecordService.workspace = () => Promise.resolve(initial);
  purchaseRecordService.order = (_projectId, input) => {
    calls.push(input);
    return Promise.resolve(initial);
  };
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const holder: { current: ReturnType<typeof usePurchaseWorkspace> | null } = { current: null };
  const Probe = () => {
    holder.current = usePurchaseWorkspace("project-1", "", null);
    return null;
  };
  const rendered: { current: ReturnType<typeof create> | null } = { current: null };
  try {
    await act(async () => {
      rendered.current = create(
        <QueryClientProvider client={client}>
          <Probe />
        </QueryClientProvider>,
      );
    });
    await act(async () => {
      holder.current?.selectLine(initial.lines[0], true);
      holder.current?.selectLine(initial.lines[1], true);
      holder.current?.setQuantities({ a: "3", b: "8" });
      holder.current?.setSupplierName("ספק אחד");
      holder.current?.setOrderDate("2026-11-17");
    });
    assert.deepEqual(holder.current?.selectedIds, ["a", "b"]);
    assert.ok(matchesPurchaseLine(initial.lines[1], "בידוד", "חומר"));
    await act(async () => holder.current?.submit("order"));
    assert.equal(calls.length, 1);
    assert.equal(calls[0].supplierName, "ספק אחד");
    assert.deepEqual(
      calls[0].lines.map(item => item.quantity),
      ["3", "8"],
    );
    assert.deepEqual(holder.current?.selectedIds, []);
  } finally {
    purchaseRecordService.workspace = originalWorkspace;
    purchaseRecordService.order = originalOrder;
    await act(async () => rendered.current?.unmount());
    client.clear();
  }
});

test("selected supplier reuses matching agreement prices and rejects mixed supplier groups", async () => {
  const originalWorkspace = purchaseRecordService.workspace;
  const originalOrder = purchaseRecordService.order;
  const calls: {
    supplierId?: string;
    lines: {
      agreementId?: string;
      agreementVersion?: number;
      quantity: string;
      unitCost?: string;
    }[];
  }[] = [];
  const agreement = (id: string, supplierId: string): ISupplierAgreement => ({
    id: `agreement:${id}:${supplierId}`,
    projectId: "project-1",
    boqSourceKey: `source:${id}`,
    materialId: `material:${id}`,
    materialUnit: "unit",
    supplierId,
    supplierName: "ספק אחד",
    unitPrice: "12.5000",
    currencyCode: "ILS",
    agreedQuantity: "5.00000000",
    effectiveFrom: null,
    effectiveThrough: null,
    active: true,
    version: 1,
    notes: "",
  });
  const agreements = [agreement("a", "supplier-1"), agreement("b", "supplier-1")];
  purchaseRecordService.workspace = () => Promise.resolve(initial);
  purchaseRecordService.order = (_projectId, input) => {
    calls.push(input);
    return Promise.resolve(initial);
  };
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const holder: { current: ReturnType<typeof usePurchaseWorkspace> | null } = { current: null };
  const Probe = () => {
    holder.current = usePurchaseWorkspace("project-1", "", null);
    return null;
  };
  const rendered: { current: ReturnType<typeof create> | null } = { current: null };
  try {
    await act(async () => {
      rendered.current = create(
        <QueryClientProvider client={client}>
          <Probe />
        </QueryClientProvider>,
      );
    });
    await act(async () => {
      holder.current?.selectLine(initial.lines[0], true);
      holder.current?.selectLine(initial.lines[1], true);
      holder.current?.setQuantities({ a: "3", b: "4" });
      holder.current?.setSupplierId("supplier-1");
      holder.current?.setOrderDate("2026-11-17");
    });
    assert.equal(
      matchingAgreement(agreements, initial.lines[0], "supplier-1", "2026-11-17")?.id,
      agreements[0].id,
    );
    await act(async () => holder.current?.submit("order", [agreements[0]]));
    assert.equal(calls.length, 0);
    assert.match(holder.current?.error ?? "", /אין הסכם מתאים/);
    await act(async () => holder.current?.submit("order", agreements));
    assert.equal(calls.length, 1);
    assert.equal(calls[0].supplierId, "supplier-1");
    assert.deepEqual(
      calls[0].lines.map(item => item.agreementId),
      agreements.map(item => item.id),
    );
    assert.deepEqual(
      calls[0].lines.map(item => item.quantity),
      ["3", "4"],
    );
    assert.deepEqual(
      calls[0].lines.map(item => item.agreementVersion),
      [1, 1],
    );
    assert.deepEqual(
      calls[0].lines.map(item => item.unitCost),
      ["12.5000", "12.5000"],
    );
  } finally {
    purchaseRecordService.workspace = originalWorkspace;
    purchaseRecordService.order = originalOrder;
    await act(async () => rendered.current?.unmount());
    client.clear();
  }
});

test("failed order retains selected lines and entered quantities", async () => {
  const originalWorkspace = purchaseRecordService.workspace;
  const originalOrder = purchaseRecordService.order;
  purchaseRecordService.workspace = () => Promise.resolve(initial);
  purchaseRecordService.order = () => Promise.reject(new Error("save failed"));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const holder: { current: ReturnType<typeof usePurchaseWorkspace> | null } = { current: null };
  const Probe = () => {
    holder.current = usePurchaseWorkspace("project-1", "", null);
    return null;
  };
  const rendered: { current: ReturnType<typeof create> | null } = { current: null };
  try {
    await act(async () => {
      rendered.current = create(
        <QueryClientProvider client={client}>
          <Probe />
        </QueryClientProvider>,
      );
    });
    await act(async () => {
      holder.current?.selectLine(initial.lines[0], true);
      holder.current?.setQuantities({ a: "3" });
      holder.current?.setSupplierName("ספק אחד");
      holder.current?.setOrderDate("2026-11-17");
    });
    await act(async () => holder.current?.submit("order"));
    assert.deepEqual(holder.current?.selectedIds, ["a"]);
    assert.equal(holder.current?.quantities.a, "3");
    assert.ok(holder.current?.error);
  } finally {
    purchaseRecordService.workspace = originalWorkspace;
    purchaseRecordService.order = originalOrder;
    await act(async () => rendered.current?.unmount());
    client.clear();
  }
});

test("rendered ordered control records an order, persists across categories, and opens correction", async () => {
  const originalWorkspace = purchaseRecordService.workspace;
  const originalOrder = purchaseRecordService.order;
  const originalCorrect = purchaseRecordService.correct;
  const fixture: { data: IPurchaseWorkspace; orders: number; corrections: number } = {
    data: initial,
    orders: 0,
    corrections: 0,
  };
  purchaseRecordService.workspace = () => Promise.resolve(fixture.data);
  purchaseRecordService.order = () => {
    fixture.orders += 1;
    fixture.data = {
      ...initial,
      lines: [
        { ...initial.lines[0], ordered: true, orderedQuantity: "3", remainingQuantity: "7" },
        initial.lines[1],
      ],
      history: [
        {
          id: "order-1",
          notes: "",
          status: PURCHASE_RECORD_STATUS.ORDERED,
          createdAt: "2026-11-17T12:00:00.000Z",
          updatedAt: "2026-11-17T12:00:00.000Z",
          createdById: "user-1",
          updatedById: "user-1",
          orderDate: "2026-11-17",
          onBehalfOf: null,
          supplierName: "ספק אחד",
          exceptionReason: null,
          lines: [
            {
              id: "order-line-1",
              quantity: "3",
              activeQuantity: "3",
              materialName: "חומר a",
              materialUnit: "unit",
              boqSourceKey: "source:a",
              currencyCode: "ILS",
              unitCost: null,
            },
          ],
          events: [],
        },
      ],
    };
    return Promise.resolve(fixture.data);
  };
  purchaseRecordService.correct = () => {
    fixture.corrections += 1;
    fixture.data = initial;
    return Promise.resolve(fixture.data);
  };
  const authorizedSession = {
    accessToken: "test",
    user: {
      id: "user-1",
      email: "test@example.invalid",
      phone: "",
      firstName: "Test",
      lastName: "User",
      employeeNumber: "1",
      deletedAt: null,
      role: USER_ROLES.PURCHASING_EXECUTION_MANAGER,
      assignedRoles: [USER_ROLES.PURCHASING_EXECUTION_MANAGER],
      permissions: [PERMISSIONS.PURCHASE_REQUESTS_REVIEW, PERMISSIONS.PURCHASE_ORDERS_APPROVE],
    },
  };
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const rendered: { current: ReturnType<typeof create> | null } = { current: null };
  const orderedCheck = () =>
    rendered.current?.root.findAllByType(CheckBox).find(box => box.props.text === "הוזמן");
  try {
    await act(async () => {
      setSession(authorizedSession);
      rendered.current = create(
        <QueryClientProvider client={client}>
          <PurchaseWorkspace
            boqRevision={1}
            canManageBoq={false}
            projectId="project-1"
            onUpdateBoqLine={() => Promise.resolve()}
          />
        </QueryClientProvider>,
      );
    });
    assert.equal(rendered.current?.root.findByType(Tabs).props.activeId, "צנרת");
    assert.equal(rendered.current?.root.findByType(Tabs).props.isScrollable, true);
    assert.equal(orderedCheck()?.props.value, false);
    await act(async () => orderedCheck()?.props.onChange(true));
    assert.ok(
      rendered.current?.root
        .findAllByType(Button)
        .some(button => button.props.text === "רשום כהוזמן"),
    );
    await act(async () => {
      const fields = rendered.current?.root.findAll(node => node.props.title === "ספק");
      fields?.[0]?.props.onChange("ספק אחד");
      rendered.current?.root
        .findAll(node => node.props.title === "תאריך הזמנה")?.[0]
        ?.props.onChange("2026-11-17");
      rendered.current?.root
        .findAll(node => node.props.title === "כמות חומר a")?.[0]
        ?.props.onChange("3");
    });
    await act(async () =>
      rendered.current?.root
        .findAllByType(Button)
        .find(button => button.props.text === "רשום כהוזמן")
        ?.props.onClick(),
    );
    assert.equal(fixture.orders, 1);
    assert.equal(orderedCheck()?.props.value, true);
    assert.ok(JSON.stringify(rendered.current?.toJSON()).includes("ספק אחד"));
    await act(async () => {
      rendered.current?.unmount();
      rendered.current = create(
        <QueryClientProvider client={client}>
          <PurchaseWorkspace
            boqRevision={1}
            canManageBoq={false}
            projectId="project-1"
            onUpdateBoqLine={() => Promise.resolve()}
          />
        </QueryClientProvider>,
      );
    });
    assert.equal(orderedCheck()?.props.value, true);
    await act(async () => rendered.current?.root.findByType(Tabs).props.onChange("בידוד"));
    await act(async () => rendered.current?.root.findByType(Tabs).props.onChange("צנרת"));
    assert.equal(orderedCheck()?.props.value, true);
    await act(async () => orderedCheck()?.props.onChange(false));
    assert.ok(
      rendered.current?.root
        .findAllByType(Button)
        .some(button => button.props.text === "שמור תיקון"),
    );
    await act(async () =>
      rendered.current?.root
        .findAll(node => node.props.title === "סיבת התיקון")?.[0]
        ?.props.onChange("תיקון"),
    );
    await act(async () =>
      rendered.current?.root
        .findAllByType(Button)
        .find(button => button.props.text === "שמור תיקון")
        ?.props.onClick(),
    );
    assert.equal(fixture.corrections, 1);
    assert.equal(orderedCheck()?.props.value, false);
    await act(async () =>
      setSession({
        ...authorizedSession,
        user: { ...authorizedSession.user, permissions: [PERMISSIONS.PURCHASE_REQUESTS_REVIEW] },
      }),
    );
    assert.equal(orderedCheck()?.props.disabled, true);
  } finally {
    purchaseRecordService.workspace = originalWorkspace;
    purchaseRecordService.order = originalOrder;
    purchaseRecordService.correct = originalCorrect;
    await act(async () => {
      setSession(null);
      rendered.current?.unmount();
    });
    client.clear();
  }
});
