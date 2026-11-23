import {
  addPaymentStage,
  changePaymentStage,
  removePaymentStage,
  paymentScheduleTotal,
  applyCustomerPaymentDefault,
  customerPaymentConfiguration,
  selectPaymentConfigurationTerm,
  configuredCustomerPaymentDefault,
  selectPaymentConfigurationStages,
  getCustomerPaymentConfigurationError,
} from "../src/utilities/payment-configuration.utility";

import {
  PAYMENT_CONFIGURATION_COPY,
  CUSTOMER_PAYMENT_TERMS_VALUES,
} from "../src/constants/payment-configuration.constant";

import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { act, create } from "react-test-renderer";
import Button from "../src/components/Button/Button";
import { quotationFixture } from "./quotation.fixture";
import { setTimeout as settle } from "node:timers/promises";
import { TIME_UNITS } from "../src/constants/time.constant";
import ChoiceRow from "../src/components/ChoiceRow/ChoiceRow";
import TextField from "../src/components/TextField/TextField";
import { isApiCustomer } from "../src/utilities/guards/api.guard";
import { customerService } from "../src/services/customer.service";
import type { IApiCustomer } from "../src/interfaces/api.interface";
import { PAYMENT_TERMS } from "../src/constants/payment-terms.constant";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PAYMENT_STAGE_LIMITS } from "../src/constants/payment-configuration.constant";
import { quotationPaymentConfiguration } from "../src/utilities/quotation-payment.utility";
import type { IPaymentConfiguration } from "../src/interfaces/payment-configuration.interface";
import QuotationCustomerPaymentDefault from "../src/pages/quotations/components/QuotationCustomerPaymentDefault";
import PaymentConfigurationEditor from "../src/components/PaymentConfigurationEditor/PaymentConfigurationEditor";

const custom: IPaymentConfiguration = {
  paymentTerms: null,
  paymentSchedule: [
    { percent: "33.3333", text: "בחתימת ההזמנה" },
    { percent: "33.3333", text: "באספקה" },
    { percent: "33.3334", text: "במסירה" },
  ],
};
const customerFixture = (): IApiCustomer => ({
  id: "customer1",
  name: "לקוח תנאי תשלום",
  taxId: "123456782",
  address: "הרצל 1",
  createdAt: "2026-11-23T00:00:00.000Z",
  phone: null,
  email: null,
  contactName: null,
  customerType: "company",
  priorityId: null,
  prioritySyncedAt: null,
  prioritySyncStatus: "pending",
  prioritySyncAttempts: 0,
  prioritySyncError: null,
  ...customerPaymentConfiguration(custom),
});

test("customer custom stages require meaningful text, bounded precise percentages and exact 100", () => {
  assert.equal(paymentScheduleTotal(custom), "100");
  assert.equal(
    getCustomerPaymentConfigurationError({
      paymentTerms: null,
      paymentSchedule: [
        { percent: "0", text: "ללא מקדמה" },
        { percent: "100", text: "במסירה" },
      ],
    }),
    null,
  );
  assert.equal(getCustomerPaymentConfigurationError(custom), null);
  const invalidStages = [
    { percent: "100", text: " " },
    { percent: "100", text: "x".repeat(PAYMENT_STAGE_LIMITS.TEXT + 1) },
    { percent: "-1", text: "אחוז שלילי" },
    { percent: "101", text: "יותר מהסכום" },
    { percent: "100.00001", text: "דיוק חורג" },
    { percent: "NaN", text: "מספר שגוי" },
    { percent: "1e2", text: "כתיב מדעי" },
    { percent: "99.9999", text: "לא שלם" },
  ];
  invalidStages.forEach(stage =>
    assert.notEqual(
      getCustomerPaymentConfigurationError({ paymentTerms: null, paymentSchedule: [stage] }),
      null,
      JSON.stringify(stage),
    ),
  );
  assert.notEqual(
    getCustomerPaymentConfigurationError({ ...custom, paymentTerms: PAYMENT_TERMS.PREPAID }),
    null,
  );
  assert.notEqual(
    getCustomerPaymentConfigurationError({
      paymentTerms: null,
      paymentSchedule: Array.from({ length: PAYMENT_STAGE_LIMITS.COUNT + 1 }, (_stage, index) => ({
        percent: index === PAYMENT_STAGE_LIMITS.COUNT ? "70" : "1",
        text: "שלב",
      })),
    }),
    null,
  );
});

test("unset and fixed defaults remain valid while legacy Other is never copied as a configured default", () => {
  assert.equal(
    getCustomerPaymentConfigurationError({ paymentTerms: null, paymentSchedule: [] }),
    null,
  );
  assert.equal(configuredCustomerPaymentDefault({}), null);
  assert.equal(configuredCustomerPaymentDefault({ paymentTerms: PAYMENT_TERMS.OTHER }), null);
  assert.deepEqual(configuredCustomerPaymentDefault({ paymentTerms: PAYMENT_TERMS.PREPAID }), {
    paymentTerms: PAYMENT_TERMS.PREPAID,
    paymentSchedule: [],
  });
  assert.deepEqual(configuredCustomerPaymentDefault(custom), custom);
});

test("applying a customer default makes an independent quotation snapshot and preserves its local note", () => {
  const quotation = { ...quotationFixture(), paymentTermsNote: "הערה מקומית" };
  const customer = customerFixture();
  const next = applyCustomerPaymentDefault(quotation, customer);
  assert.notEqual(next, quotation);
  assert.deepEqual(next.paymentSchedule, customer.paymentSchedule);
  assert.notEqual(next.paymentSchedule, customer.paymentSchedule);
  assert.notEqual(next.paymentSchedule[0], customer.paymentSchedule?.[0]);
  assert.equal(next.paymentTermsNote, "הערה מקומית");
  assert.equal(quotation.paymentTerms, PAYMENT_TERMS.PREPAID);
  assert.deepEqual(quotation.paymentSchedule, []);
  const edited = changePaymentStage({
    configuration: quotationPaymentConfiguration(next),
    index: 0,
    changes: { text: "החלפה בהצעה בלבד" },
  });
  assert.equal(edited.paymentSchedule[0].text, "החלפה בהצעה בלבד");
  assert.equal(customer.paymentSchedule?.[0].text, "בחתימת ההזמנה");
  assert.equal(next.paymentSchedule[0].text, "בחתימת ההזמנה");
});

test("stale customer data, missing defaults and invalid legacy configurations never replace manual quotation edits", () => {
  const quotation = { ...quotationFixture(), ...custom, paymentTermsNote: "לא לאבד" };
  const customer = customerFixture();
  assert.equal(
    applyCustomerPaymentDefault(quotation, { ...customer, id: "previous-customer" }),
    quotation,
  );
  assert.equal(applyCustomerPaymentDefault(quotation, null), quotation);
  assert.equal(
    applyCustomerPaymentDefault(quotation, {
      ...customer,
      paymentTerms: null,
      paymentSchedule: [],
    }),
    quotation,
  );
  assert.equal(
    applyCustomerPaymentDefault(quotation, {
      ...customer,
      paymentTerms: PAYMENT_TERMS.OTHER,
      paymentSchedule: [],
    }),
    quotation,
  );
  assert.equal(
    applyCustomerPaymentDefault(quotation, {
      ...customer,
      paymentTerms: null,
      paymentSchedule: [{ percent: "50", text: "טיוטה לא תקינה" }],
    }),
    quotation,
  );
});

test("stage edits, add/remove and preset selection return independent configurations without mutating their source", () => {
  const initial = selectPaymentConfigurationTerm(PAYMENT_TERMS.PREPAID);
  const staged = selectPaymentConfigurationStages(initial);
  assert.deepEqual(initial, { paymentTerms: PAYMENT_TERMS.PREPAID, paymentSchedule: [] });
  assert.deepEqual(staged, { paymentTerms: null, paymentSchedule: [{ percent: "0", text: "" }] });
  const changed = changePaymentStage({
    configuration: staged,
    index: 0,
    changes: { percent: "100", text: "הזמנה" },
  });
  assert.equal(staged.paymentSchedule[0].percent, "0");
  assert.equal(getCustomerPaymentConfigurationError(changed), null);
  const added = addPaymentStage(changed);
  assert.equal(changed.paymentSchedule.length, 1);
  assert.equal(added.paymentSchedule.length, 2);
  const removed = removePaymentStage(added, 1);
  assert.deepEqual(removed, changed);
  assert.equal(added.paymentSchedule.length, 2);
  assert.deepEqual(selectPaymentConfigurationTerm(null), {
    paymentTerms: null,
    paymentSchedule: [],
  });
});

test("the shared customer editor exposes custom/unset choices and no invented currency amounts", async () => {
  Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
  const state: { renderer: ReturnType<typeof create> | null } = { renderer: null };
  try {
    await act(async () => {
      state.renderer = create(
        <PaymentConfigurationEditor
          allowUnset
          value={custom}
          onChange={() => {}}
          termsOptions={CUSTOMER_PAYMENT_TERMS_VALUES}
          customLabel={PAYMENT_CONFIGURATION_COPY.CUSTOM}
        />,
      );
    });
    const renderer = state.renderer;
    assert.ok(renderer);
    const labels = renderer.root.findAllByType(ChoiceRow).map(choice => choice.props.children);
    assert.ok(labels.includes(PAYMENT_CONFIGURATION_COPY.CUSTOM));
    assert.ok(labels.includes(PAYMENT_CONFIGURATION_COPY.NONE));
    assert.equal(labels.includes("אחר"), false);
    assert.equal(renderer.root.findAllByType("bdi").length, 0);
    assert.ok(
      renderer.root.findAllByType(Button).some(button => button.props.ariaLabel === "הסר שלב 1"),
    );
    const percent = renderer.root
      .findAllByType(TextField)
      .find(field => field.props.title === PAYMENT_CONFIGURATION_COPY.PERCENT);
    assert.ok(percent);
    assert.equal(percent.props.isLtr, true);
    await act(async () =>
      renderer.update(
        <PaymentConfigurationEditor value={custom} amounts={["₪150"]} onChange={() => {}} />,
      ),
    );
    assert.ok(renderer.root.findAllByType("bdi").some(amount => amount.children.includes("₪150")));
  } finally {
    await act(async () => state.renderer?.unmount());
  }
});

test("replacing custom stages with a preset or clearing them requires an explicit confirmation and supports cancel", async () => {
  Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
  const updates: IPaymentConfiguration[] = [];
  const state: { renderer: ReturnType<typeof create> | null } = { renderer: null };
  try {
    await act(async () => {
      state.renderer = create(
        <PaymentConfigurationEditor
          allowUnset
          value={custom}
          onChange={next => updates.push(next)}
        />,
      );
    });
    const renderer = state.renderer;
    assert.ok(renderer);
    const choice = (label: string) => {
      const result = renderer.root
        .findAllByType(ChoiceRow)
        .find(row => row.props.children === label);
      assert.ok(result, label);
      return result;
    };
    const button = (label: string) => {
      const result = renderer.root.findAllByType(Button).find(row => row.props.text === label);
      assert.ok(result, label);
      return result;
    };
    await act(async () => choice("תשלום מראש").props.onClick());
    assert.equal(updates.length, 0);
    await act(async () => button(PAYMENT_CONFIGURATION_COPY.CANCEL).props.onClick());
    assert.equal(updates.length, 0);
    assert.equal(
      renderer.root
        .findAllByType(Button)
        .some(row => row.props.text === PAYMENT_CONFIGURATION_COPY.CONFIRM),
      false,
    );
    await act(async () => choice("תשלום מראש").props.onClick());
    await act(async () => button(PAYMENT_CONFIGURATION_COPY.CONFIRM).props.onClick());
    assert.deepEqual(updates[0], { paymentTerms: PAYMENT_TERMS.PREPAID, paymentSchedule: [] });
    assert.deepEqual(
      custom.paymentSchedule.map(stage => stage.percent),
      ["33.3333", "33.3333", "33.3334"],
    );
    await act(async () => choice(PAYMENT_CONFIGURATION_COPY.NONE).props.onClick());
    assert.equal(updates.length, 1);
    await act(async () => button(PAYMENT_CONFIGURATION_COPY.CONFIRM_CLEAR).props.onClick());
    assert.deepEqual(updates[1], { paymentTerms: null, paymentSchedule: [] });
  } finally {
    await act(async () => state.renderer?.unmount());
  }
});

test("shared stage inputs preserve text and disabled state, enforce the editor limit and identify remove controls", async () => {
  const configuration: IPaymentConfiguration = {
    paymentTerms: null,
    paymentSchedule: Array.from({ length: PAYMENT_STAGE_LIMITS.COUNT }, (_stage, index) => ({
      percent: index === 0 ? "71" : "1",
      text: `שלב ${index + 1}`,
    })),
  };
  const updates: IPaymentConfiguration[] = [];
  const state: { renderer: ReturnType<typeof create> | null } = { renderer: null };
  try {
    await act(async () => {
      state.renderer = create(
        <PaymentConfigurationEditor value={configuration} onChange={next => updates.push(next)} />,
      );
    });
    const renderer = state.renderer;
    assert.ok(renderer);
    const add = renderer.root
      .findAllByType(Button)
      .find(button => button.props.ariaLabel === PAYMENT_CONFIGURATION_COPY.ADD_LABEL);
    assert.ok(add);
    assert.equal(add.props.disabled, true);
    const milestone = renderer.root
      .findAllByType(TextField)
      .find(field => field.props.title === PAYMENT_CONFIGURATION_COPY.MILESTONE);
    assert.ok(milestone);
    await act(async () => milestone.props.onChange("טקסט חדש"));
    assert.equal(updates[0].paymentSchedule[0].text, "טקסט חדש");
    assert.equal(configuration.paymentSchedule[0].text, "שלב 1");
    const remove = renderer.root
      .findAllByType(Button)
      .find(button => button.props.ariaLabel === "הסר שלב 2");
    assert.ok(remove);
    await act(async () => remove.props.onClick());
    assert.equal(updates[1].paymentSchedule.length, PAYMENT_STAGE_LIMITS.COUNT - 1);
    assert.equal(updates[1].paymentSchedule[1].text, "שלב 3");
    await act(async () =>
      renderer.update(
        <PaymentConfigurationEditor
          disabled
          value={configuration}
          onChange={next => updates.push(next)}
        />,
      ),
    );
    assert.ok(renderer.root.findAllByType(TextField).every(field => field.props.disabled));
    assert.ok(renderer.root.findAllByType(ChoiceRow).every(choice => choice.props.disabled));
    assert.equal(renderer.root.findAllByType(Button).length, 0);
  } finally {
    await act(async () => state.renderer?.unmount());
  }
});

test("customer response guards validate optional stage arrays without rejecting legacy omitted schedules", () => {
  const customer = customerFixture();
  assert.equal(isApiCustomer(customer), true);
  const legacy = { ...customer };
  delete legacy.paymentSchedule;
  assert.equal(isApiCustomer(legacy), true);
  [
    null,
    {},
    "stages",
    [{ percent: 100, text: "מסירה" }],
    [{ percent: "100" }],
    [{ percent: "100", text: null }],
  ].forEach(paymentSchedule =>
    assert.equal(isApiCustomer({ ...customer, paymentSchedule }), false),
  );
});

test("rapid customer switching never applies a stale default or overwrites the quotation before explicit confirmation", async () => {
  const previous = Promise.withResolvers<IApiCustomer>();
  const selected = Promise.withResolvers<IApiCustomer>();
  const request = mock.method(customerService, "getById", async (id: string) =>
    id === "previous-customer" ? previous.promise : selected.promise,
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const original = {
    ...quotationFixture(),
    ...custom,
    customerId: "previous-customer",
    paymentTermsNote: "לא לאבד הערה",
  };
  const current = { ...original, customerId: "selected-customer" };
  const changes: ReturnType<typeof quotationFixture>[] = [];
  const state: { renderer: ReturnType<typeof create> | null } = { renderer: null };
  const render = (quotation: ReturnType<typeof quotationFixture>) => (
    <QueryClientProvider client={client}>
      <QuotationCustomerPaymentDefault
        disabled={false}
        quotation={quotation}
        onChange={next => changes.push(next)}
        originalCustomerId="original-customer"
      />
    </QueryClientProvider>
  );
  try {
    await act(async () => {
      state.renderer = create(render(original));
    });
    const renderer = state.renderer;
    assert.ok(renderer);
    const canApply = () =>
      renderer.root
        .findAllByType(Button)
        .some(button => button.props.text === PAYMENT_CONFIGURATION_COPY.APPLY);
    assert.equal(canApply(), false);
    await act(async () => renderer.update(render(current)));
    await act(async () => {
      previous.resolve({
        ...customerFixture(),
        id: "previous-customer",
        paymentTerms: PAYMENT_TERMS.PREPAID,
        paymentSchedule: [],
      });
      await settle(TIME_UNITS.SECOND_MS / 100);
    });
    assert.equal(canApply(), false);
    assert.equal(changes.length, 0);
    await act(async () => {
      selected.resolve({
        ...customerFixture(),
        id: "selected-customer",
        paymentTerms: PAYMENT_TERMS.PREPAID,
        paymentSchedule: [],
      });
      await settle(TIME_UNITS.SECOND_MS / 100);
    });
    assert.equal(canApply(), true);
    assert.equal(changes.length, 0);
    const apply = renderer.root
      .findAllByType(Button)
      .find(button => button.props.text === PAYMENT_CONFIGURATION_COPY.APPLY);
    assert.ok(apply);
    await act(async () => apply.props.onClick());
    assert.equal(changes[0].customerId, "selected-customer");
    assert.equal(changes[0].paymentTerms, PAYMENT_TERMS.PREPAID);
    assert.deepEqual(changes[0].paymentSchedule, []);
    assert.equal(changes[0].paymentTermsNote, "לא לאבד הערה");
    assert.deepEqual(current.paymentSchedule, custom.paymentSchedule);
  } finally {
    previous.resolve(customerFixture());
    selected.resolve(customerFixture());
    await act(async () => state.renderer?.unmount());
    client.clear();
    request.mock.restore();
  }
});

test("customer-default lookup failure keeps manual edits and retries before offering an explicit replacement", async () => {
  const state = { failed: true, renderer: null as ReturnType<typeof create> | null };
  const request = mock.method(customerService, "getById", async () => {
    if (state.failed) {
      throw new Error("Customer lookup failed");
    }
    return customerFixture();
  });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const quotation = { ...quotationFixture(), paymentTermsNote: "הערת ההצעה" };
  const changes: ReturnType<typeof quotationFixture>[] = [];
  try {
    await act(async () => {
      state.renderer = create(
        <QueryClientProvider client={client}>
          <QuotationCustomerPaymentDefault
            disabled={false}
            quotation={quotation}
            originalCustomerId="another-customer"
            onChange={next => changes.push(next)}
          />
        </QueryClientProvider>,
      );
      await settle(TIME_UNITS.SECOND_MS / 100);
    });
    await act(async () => settle(TIME_UNITS.SECOND_MS / 100));
    const renderer = state.renderer;
    assert.ok(renderer);
    assert.equal(changes.length, 0);
    assert.equal(
      renderer.root
        .findAllByType(Button)
        .some(button => button.props.text === PAYMENT_CONFIGURATION_COPY.APPLY),
      false,
    );
    const retry = renderer.root
      .findAllByType(Button)
      .find(button => button.props.text === PAYMENT_CONFIGURATION_COPY.RETRY);
    assert.ok(retry);
    state.failed = false;
    await act(async () => {
      await retry.props.onClick();
      await settle(TIME_UNITS.SECOND_MS / 100);
    });
    assert.equal(changes.length, 0);
    const apply = renderer.root
      .findAllByType(Button)
      .find(button => button.props.text === PAYMENT_CONFIGURATION_COPY.APPLY);
    assert.ok(apply);
    await act(async () => apply.props.onClick());
    assert.deepEqual(changes[0].paymentSchedule, custom.paymentSchedule);
    assert.equal(changes[0].paymentTermsNote, "הערת ההצעה");
    assert.deepEqual(quotation.paymentSchedule, []);
  } finally {
    await act(async () => state.renderer?.unmount());
    client.clear();
    request.mock.restore();
  }
});

test("no-preference customers and read-only quotations expose no payment replacement action", async () => {
  const request = mock.method(customerService, "getById", async () => ({
    ...customerFixture(),
    paymentTerms: null,
    paymentSchedule: [],
  }));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const quotation = quotationFixture();
  const changes: ReturnType<typeof quotationFixture>[] = [];
  const state: { renderer: ReturnType<typeof create> | null } = { renderer: null };
  const render = (disabled: boolean) => (
    <QueryClientProvider client={client}>
      <QuotationCustomerPaymentDefault
        disabled={disabled}
        quotation={quotation}
        onChange={next => changes.push(next)}
        originalCustomerId={quotation.customerId}
      />
    </QueryClientProvider>
  );
  try {
    await act(async () => {
      state.renderer = create(render(false));
      await settle(TIME_UNITS.SECOND_MS / 100);
    });
    await act(async () => settle(TIME_UNITS.SECOND_MS / 100));
    const renderer = state.renderer;
    assert.ok(renderer);
    assert.equal(renderer.root.findAllByType(Button).length, 0);
    assert.equal(changes.length, 0);
    assert.ok(
      renderer.root.findAll(node => node.props.children === PAYMENT_CONFIGURATION_COPY.NO_DEFAULT)
        .length > 0,
    );
    const calls = request.mock.callCount();
    await act(async () => renderer.update(render(true)));
    assert.equal(renderer.root.findAllByType(Button).length, 0);
    assert.equal(request.mock.callCount(), calls);
    assert.equal(changes.length, 0);
  } finally {
    await act(async () => state.renderer?.unmount());
    client.clear();
    request.mock.restore();
  }
});
