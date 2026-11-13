import { test } from "node:test";
import assert from "node:assert/strict";
import { MemoryRouter } from "react-router-dom";
import { renderToStaticMarkup } from "react-dom/server";
import { setSession } from "../src/store/session.store";
import { QueryClientProvider } from "@tanstack/react-query";
import { PERMISSIONS } from "../src/constants/permission.constant";
import TaskTypeChip from "../src/components/TaskTypeChip/TaskTypeChip";
import TaskTypeField from "../src/pages/task-form/components/TaskTypeField";
import { createClient, engineer, formValues, noop } from "./project-tasks.fixture";
import { TASK_TYPES, TASK_TYPE_LABELS } from "../src/constants/task-type.constant";
import TaskAssignmentCard from "../src/pages/task-form/components/TaskAssignmentCard";

test("task type selector offers General, quotation and planning choices", () => {
  const markup = renderToStaticMarkup(<TaskTypeField onChange={noop} value={TASK_TYPES.GENERAL} />);
  assert.match(markup, />כללי</);
  assert.match(markup, /סוג משימה/);
  assert.match(markup, /מוסיפים משימה רק כשנדרשת עבודה/);
});

test("persisted protected and general types each render their own readable label", () => {
  Object.values(TASK_TYPES).forEach(taskType => {
    const markup = renderToStaticMarkup(<TaskTypeChip taskType={taskType} />);
    assert.ok(markup.includes(TASK_TYPE_LABELS[taskType]));
    assert.doesNotMatch(markup, /<button|<select|role="option/);
  });
});

test("assignment UI always shows the project and never offers a customer-or-project radio", () => {
  const client = createClient();
  setSession({
    accessToken: "unit-test-token",
    user: { ...engineer, permissions: [PERMISSIONS.TASKS_CREATE] },
  });
  try {
    const markup = renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <TaskAssignmentCard values={formValues} errors={{}} onChange={noop} onLinkChange={noop} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    assert.match(markup, /הפרויקט הנבחר/);
    assert.match(markup, /החלף פרויקט/);
    assert.match(markup, />כללי</);
    assert.doesNotMatch(markup, /המשימה קשורה|בחר לקוח|role="radiogroup|role="radio"/);
  } finally {
    setSession(null);
    client.clear();
  }
});
