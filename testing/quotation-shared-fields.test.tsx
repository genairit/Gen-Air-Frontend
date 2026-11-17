import { test } from "node:test";
import assert from "node:assert/strict";
import { act, create } from "react-test-renderer";
import TextField from "../src/components/TextField/TextField";
import SelectField from "../src/components/SelectField/SelectField";
import QuotationInput from "../src/pages/quotations/components/QuotationInput";
import QuotationSelect from "../src/pages/quotations/components/QuotationSelect";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
Reflect.set(globalThis, "window", new EventTarget());

test("quotation inputs preserve free text, decimal values, and event-based changes", async () => {
  const changes: string[] = [];
  const renderer = { value: null as ReturnType<typeof create> | null };

  try {
    await act(async () => {
      renderer.value = create(
        <QuotationInput
          label="פריט"
          value="Mixed text 123"
          onChange={event => changes.push(event.target.value)}
        />,
      );
    });
    const textField = renderer.value!.root.findByType(TextField);
    assert.equal(textField.props.validator("Mixed text 123".repeat(10)).errorText, "");
    await act(async () =>
      textField.props.onChange("new value", { target: { value: "new value" } }),
    );
    assert.deepEqual(changes, ["new value"]);

    await act(async () => {
      renderer.value!.update(
        <QuotationInput
          label="מחיר"
          type="number"
          step="0.0001"
          value="1.2500"
          onChange={event => changes.push(event.target.value)}
        />,
      );
    });
    const numberField = renderer.value!.root.findByType(TextField);
    assert.equal(numberField.props.type, "number");
    assert.equal(numberField.props.validator("1.2500").errorText, "");
    assert.equal(numberField.props.slotProps.htmlInput.step, "0.0001");
  } finally {
    await act(async () => renderer.value?.unmount());
  }
});

test("quotation select supplies labelled options through the shared select field", async () => {
  const choices = [{ value: "first", label: "ראשון" }];
  const renderer = { value: null as ReturnType<typeof create> | null };

  try {
    await act(async () => {
      renderer.value = create(
        <QuotationSelect label="מעגל" value="first" items={choices} onChange={() => {}} />,
      );
    });
    const select = renderer.value!.root.findByType(SelectField);
    assert.equal(select.props.ariaLabel, "מעגל");
    assert.deepEqual(select.props.items, choices);
  } finally {
    await act(async () => renderer.value?.unmount());
  }
});
