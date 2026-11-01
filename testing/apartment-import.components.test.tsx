import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import DropZone from "../src/components/DropZone/DropZone";
import ImportResults from "../src/components/ApartmentImport/components/ImportResults";
import ImportProcessing from "../src/components/ApartmentImport/components/ImportProcessing";
import ServerErrorBanner from "../src/components/ApartmentImport/components/ServerErrorBanner";

const ignoreSelection = (): void => {};
const completeAction = async (): Promise<void> => {};

test("DropZone preserves multiple by default and supports a single-file picker", () => {
  const props = {
    title: "קובץ",
    description: "קובץ",
    buttonLabel: "בחירה",
    onFilesSelected: ignoreSelection,
  };
  const defaultMarkup = renderToStaticMarkup(<DropZone {...props} />);
  const singleMarkup = renderToStaticMarkup(<DropZone multiple={false} {...props} />);
  assert.match(defaultMarkup, /multiple=""/);
  assert.doesNotMatch(singleMarkup, /multiple=""/);
});

test("results render real counts, skipped reason, download and retry controls", () => {
  const result = {
    counts: { created: 1, existing: 1, duplicate: 0, error: 0 },
    rows: [
      { rowNumber: 3, apartment: "12", status: "existing" as const, reason: "הדירה כבר קיימת" },
    ],
  };
  const markup = renderToStaticMarkup(
    <ImportResults result={result} onRetry={ignoreSelection} onDownloadReport={completeAction} />,
  );
  assert.match(markup, /1 מתוך 2 שורות נקלטו/);
  assert.match(markup, /הדירה כבר קיימת/);
  assert.match(markup, /הורד דוח שגיאות/);
  assert.match(markup, /העלה קובץ מתוקן/);
  assert.doesNotMatch(markup, /יתעדכנו/);
});

test("template rejection explicitly says nothing was created", () => {
  const failure = { title: "שגיאה", message: "חסרה עמודה", code: "INVALID_TEMPLATE" };
  const markup = renderToStaticMarkup(<ServerErrorBanner failure={failure} />);
  assert.match(markup, /הייבוא נכשל: מבנה הקובץ לא תואם/);
  assert.match(markup, /לא נוצרה ולא עודכנה אף דירה/);
  assert.match(markup, /חסרה עמודה/);
});

test("processing renders actual progress or an indeterminate indicator", () => {
  const progress = renderToStaticMarkup(<ImportProcessing progress={42} fileName="input.xlsx" />);
  const waiting = renderToStaticMarkup(<ImportProcessing progress={null} fileName="input.xlsx" />);
  assert.match(progress, /aria-valuenow="42"/);
  assert.doesNotMatch(waiting, /aria-valuenow=/);
  assert.match(waiting, /מעבד את הקובץ/);
});
