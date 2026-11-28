import { test } from "node:test";
import assert from "node:assert/strict";
import { MemoryRouter } from "react-router-dom";
import { renderToStaticMarkup } from "react-dom/server";
import { setSession } from "../src/store/session.store";
import { QueryClientProvider } from "@tanstack/react-query";
import { PERMISSIONS } from "../src/constants/permission.constant";
import TaskTypeChip from "../src/components/TaskTypeChip/TaskTypeChip";
import TaskTypeField from "../src/pages/task-form/components/TaskTypeField";
import { TASK_TYPES, TASK_TYPE_LABELS } from "../src/constants/task-type.constant";
import TaskAssignmentCard from "../src/pages/task-form/components/TaskAssignmentCard";
import { createClient, engineer, formValues, noop, project } from "./project-tasks.fixture";

test("task type selector offers General, quotation and planning choices", () => {
  const markup = renderToStaticMarkup(<TaskTypeField onChange={noop} value={TASK_TYPES.GENERAL} />);
  assert.match(markup, /value="כללי"/);
  assert.match(markup, /סוג משימה/);
  assert.doesNotMatch(markup, /מוסיפים משימה רק כשנדרשת עבודה/);
});

test("persisted protected and general types each render their own readable label", () => {
  Object.values(TASK_TYPES).forEach(taskType => {
    const markup = renderToStaticMarkup(<TaskTypeChip taskType={taskType} />);
    assert.ok(markup.includes(TASK_TYPE_LABELS[taskType]));
    assert.doesNotMatch(markup, /<button|<select|role="option/);
  });
});

test("assignment UI offers type and assignee with no project or customer picker", () => {
  const client = createClient();
  setSession({
    accessToken: "unit-test-token",
    user: { ...engineer, permissions: [PERMISSIONS.TASKS_CREATE] },
  });
  try {
    const markup = renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <TaskAssignmentCard
            values={formValues}
            errors={{}}
            onChange={noop}
            project={project}
            canAssign={false}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    assert.doesNotMatch(markup, /החלף פרויקט|בחר פרויקט/);
    assert.match(markup, /value="כללי"/);
    assert.doesNotMatch(markup, /המשימה קשורה|בחר לקוח|role="radiogroup|role="radio"/);
  } finally {
    setSession(null);
    client.clear();
  }
});
