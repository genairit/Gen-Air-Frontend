import {
  matchesPurchaseLine,
  getPurchaseSourceLabel,
  getPurchaseQuantityNote,
} from "../src/utilities/purchase-record.utility";

import type {
  IPurchaseLine,
  IPurchaseWorkspace,
} from "../src/interfaces/purchase-record.interface";

import { test } from "node:test";
import assert from "node:assert/strict";
import Tabs from "../src/components/Tabs/Tabs";
import { act, create } from "react-test-renderer";
import Button from "../src/components/Button/Button";
import { setSession } from "../src/store/session.store";
import CheckBox from "../src/components/CheckBox/CheckBox";
import { USER_ROLES } from "../src/constants/user-role.constant";
import { PERMISSIONS } from "../src/constants/permission.constant";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PurchaseWorkspace from "../src/pages/project-boq/PurchaseWorkspace";
import { purchaseRecordService } from "../src/services/purchase-record.service";
import { PURCHASE_RECORD_STATUS } from "../src/constants/purchase-record.constant";
import { usePurchaseWorkspace } from "../src/pages/project-boq/usePurchaseWorkspace";

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
