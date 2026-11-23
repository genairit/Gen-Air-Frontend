import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { act, create } from "react-test-renderer";
import { quotationFixture } from "./quotation.fixture";
import { renderToStaticMarkup } from "react-dom/server";
import CheckBox from "../src/components/CheckBox/CheckBox";
import { QUOTATION_STATUS } from "../src/constants/quotation.constant";
import QuotationButton from "../src/pages/quotations/components/QuotationButton";
import QuotationSummary from "../src/pages/quotations/components/QuotationSummary";
import QuotationWarnings from "../src/pages/quotations/components/QuotationWarnings";
import { segmentValidationMessage } from "../src/utilities/validation-message.utility";
import ValidationMessageText from "../src/components/ValidationMessageText/ValidationMessageText";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

const mixedMessage =
  "E-SMD-63 יחידה חסרה (24,000 BTU), תשלום 30% ויחס 1:0.5–1:1.3.\nפרטים: 1/2, AC123/XYZ-98765432101234567890, 12.50.";
const quotation = {
  ...quotationFixture(),
  status: QUOTATION_STATUS.REVIEW,
  warnings: [
    { key: "existing:key", text: "אזהרה קצרה", acknowledged: true },
    { key: "rule:AC123/one", text: mixedMessage, acknowledged: false },
  ],
};

for (const text of [
  "",
  "עברית בלבד\nשורה נוספת",
  mixedMessage,
  "<script>alert('x')</script> & 50%",
]) {
  test(`validation segments preserve every character: ${JSON.stringify(text)}`, () => {
    const segments = segmentValidationMessage(text);
    assert.equal(segments.map(segment => segment.text).join(""), text);
    for (const segment of segments) {
      assert.equal(text.slice(segment.start, segment.start + segment.text.length), segment.text);
    }
    assert.deepEqual(segmentValidationMessage(text), segments);
  });
}

test("complete technical identifiers, amounts, fractions, percentages and ratios are isolated", () => {
  const fragments = segmentValidationMessage(mixedMessage)
    .filter(segment => segment.technical)
    .map(segment => segment.text);
  assert.deepEqual(fragments, [
    "E-SMD-63",
    "24,000 BTU",
    "30%",
    "1:0.5–1:1.3",
    "1/2",
    "AC123/XYZ-98765432101234567890",
    "12.50",
  ]);
});

test("Latin-leading Hebrew remains RTL with escaped text and explicit isolated runs", () => {
  const markup = renderToStaticMarkup(<ValidationMessageText text={mixedMessage} />);
  assert.match(markup, /^<span[^>]* dir="rtl"/);
  for (const technical of ["E-SMD-63", "24,000 BTU", "30%", "1:0.5–1:1.3"]) {
    assert.ok(markup.includes(`dir="ltr">${technical}</bdi>`));
  }
  assert.ok(markup.includes("\n"));
  const escaped = renderToStaticMarkup(
    <ValidationMessageText text="<img src=x onerror=alert(1)>" />,
  );
  assert.ok(!escaped.includes("<img"));
  assert.ok(escaped.includes("&lt;"));
});

test("warning labels retain checked state, separate acknowledgement copy and exact key payloads", async () => {
  const acknowledge = mock.fn<(...keys: string[][]) => Promise<void>>(async () => {});
  const state = { renderer: null as ReturnType<typeof create> | null };
  try {
    await act(async () => {
      state.renderer = create(
        <QuotationWarnings
          canApprove
          blocked={false}
          quotation={quotation}
          onAcknowledge={acknowledge}
        />,
      );
    });
    const root = state.renderer!.root;
    const controls = root.findAllByType(CheckBox);
    assert.deepEqual(
      controls.map(control => control.props.value),
      [true, false],
    );
    assert.equal(root.findAllByType("br").length, 2);
    assert.equal(root.findAllByType("label").length, 2);
    assert.equal(root.findAllByType(ValidationMessageText)[1].props.text, mixedMessage);
    await act(() => controls[1].props.onChange(true));
    assert.deepEqual(acknowledge.mock.calls[0].arguments, [["existing:key", "rule:AC123/one"]]);
    await act(() => controls[0].props.onChange(false));
    assert.deepEqual(acknowledge.mock.calls[1].arguments, [[]]);
    assert.equal(quotation.warnings[1].acknowledged, false);
  } finally {
    await act(async () => state.renderer?.unmount());
  }
});

for (const conditions of [
  { blocked: true, canApprove: true, status: QUOTATION_STATUS.REVIEW },
  { blocked: false, canApprove: false, status: QUOTATION_STATUS.REVIEW },
  { blocked: false, canApprove: true, status: QUOTATION_STATUS.APPROVED },
  { blocked: false, canApprove: true, status: QUOTATION_STATUS.CANCELLED },
]) {
  test(`acknowledgements remain disabled: ${JSON.stringify(conditions)}`, async () => {
    const state = { renderer: null as ReturnType<typeof create> | null };
    try {
      await act(async () => {
        state.renderer = create(
          <QuotationWarnings
            {...conditions}
            onAcknowledge={async () => {}}
            quotation={{ ...quotation, status: conditions.status }}
          />,
        );
      });
      const inputs = state.renderer!.root.findAllByType("input");
      assert.equal(inputs.length, 2);
      assert.ok(inputs.every(input => input.props.disabled));
      assert.equal(state.renderer!.root.findAllByType(ValidationMessageText).length, 2);
    } finally {
      await act(async () => state.renderer?.unmount());
    }
  });
}

test("required warning keeps approval disabled until successful acknowledged state arrives", async () => {
  const props = {
    blocked: false,
    disabled: false,
    canApprove: true,
    onChange: () => {},
    onTransition: async () => {},
    onAcknowledge: async () => {},
  };
  const state = { renderer: null as ReturnType<typeof create> | null };
  try {
    await act(async () => {
      state.renderer = create(<QuotationSummary {...props} quotation={quotation} />);
    });
    const approval = () =>
      state
        .renderer!.root.findAllByType(QuotationButton)
        .find(button => button.props.text === "אישור ההצעה")!;
    assert.equal(approval().props.disabled, true);
    const acknowledged = {
      ...quotation,
      warnings: quotation.warnings.map(warning => ({ ...warning, acknowledged: true })),
    };
    await act(async () => {
      state.renderer!.update(<QuotationSummary {...props} quotation={acknowledged} />);
    });
    assert.equal(approval().props.disabled, false);
    await act(async () => {
      state.renderer!.update(<QuotationSummary {...props} blocked quotation={acknowledged} />);
    });
    assert.equal(approval().props.disabled, true);
  } finally {
    await act(async () => state.renderer?.unmount());
  }
});

test("failed acknowledgement leaves required warning unchecked with original copy and keys", async () => {
  const attempted: string[][] = [];
  const acknowledge = async (keys: string[]) => {
    attempted.push(keys);
    throw new Error("AC123 נכשל\nיש לנסות שוב");
  };
  const state = { renderer: null as ReturnType<typeof create> | null };
  try {
    await act(async () => {
      state.renderer = create(
        <QuotationWarnings
          canApprove
          blocked={false}
          quotation={quotation}
          onAcknowledge={acknowledge}
        />,
      );
    });
    const control = state.renderer!.root.findAllByType(CheckBox)[1];
    await act(async () => {
      await assert.rejects(control.props.onChange(true), /AC123 נכשל/);
    });
    assert.deepEqual(attempted, [["existing:key", "rule:AC123/one"]]);
    assert.equal(control.props.value, false);
    assert.equal(
      state.renderer!.root.findAllByType(ValidationMessageText)[1].props.text,
      mixedMessage,
    );
  } finally {
    await act(async () => state.renderer?.unmount());
  }
});
