import {
  noop,
  project,
  engineer,
  createTask,
  formValues,
  createClient,
} from "./project-tasks.fixture";

import { test, after } from "node:test";
import assert from "node:assert/strict";
import type { ComponentProps } from "react";
import { MemoryRouter } from "react-router-dom";
import { act, create } from "react-test-renderer";
import Button from "../src/components/Button/Button";
import { setSession } from "../src/store/session.store";
import TextField from "../src/components/TextField/TextField";
import DateField from "../src/components/DateField/DateField";
import { httpClient } from "../src/services/http-client.service";
import { QUERY_KEYS } from "../src/constants/query-key.constant";
import { TASK_TYPES } from "../src/constants/task-type.constant";
import { PERMISSIONS } from "../src/constants/permission.constant";
import InlineError from "../src/components/InlineError/InlineError";
import { installDomEventTargets } from "./dom-event-targets.utility";
import Autocomplete from "../src/components/Autocomplete/Autocomplete";
import GenericPopup from "../src/components/GenericPopup/GenericPopup";
import { QueryClientProvider, notifyManager } from "@tanstack/react-query";
import TaskFormPopup from "../src/pages/task-form/components/TaskFormPopup";
import TaskTypeField from "../src/pages/task-form/components/TaskTypeField";
import TaskContentCard from "../src/pages/task-form/components/TaskContentCard";
import { NEW_TASK_COPY, TASK_ASSIGNEES_QUERY } from "../src/constants/task.constant";
import UrgencyConfirmPopup from "../src/components/UrgencyConfirmPopup/UrgencyConfirmPopup";
import TaskUrgencyChoiceCard from "../src/pages/task-form/components/TaskUrgencyChoiceCard";

interface ITestElement {
  type: unknown;
}
const createNodeMock = (element: ITestElement) => {
  if (element.type !== "input") {
    return null;
  }

  return {
    nodeName: "INPUT",
    value: "",
    focus: noop,
    blur: noop,
    setAttribute: noop,
    removeAttribute: noop,
    setSelectionRange: noop,
  };
};

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
after(installDomEventTargets());

test("the manual date field is optional while title and description remain required", async () => {
  const state: { renderer: ReturnType<typeof create> | null } = { renderer: null };
  try {
    await act(async () => {
      state.renderer = create(<TaskContentCard errors={{}} onChange={noop} values={formValues} />, {
        createNodeMock,
      });
    });
    const renderer = state.renderer;
    assert.ok(renderer);
    const fields = renderer.root.findAllByType(TextField);
    const date = renderer.root.findByType(DateField);
    assert.notEqual(date.props.isRequired, true);
    assert.equal(date.props.value, "");
    assert.equal(fields.filter(field => field.props.isRequired === true).length, 2);
    assert.equal(date.props.errorText ?? null, null);
  } finally {
    await act(async () => state.renderer?.unmount());
  }
});

const renderPopup = async (
  props: ComponentProps<typeof TaskFormPopup>,
  client = createClient(),
) => {
  const state: { renderer: ReturnType<typeof create> | null } = { renderer: null };
  client.setQueryData(QUERY_KEYS.projectProtectedTasks(project.id), [
    { id: "existing-quotation", taskType: TASK_TYPES.QUOTATION, available: true },
  ]);
  await act(async () => {
    state.renderer = create(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <TaskFormPopup {...props} />
        </MemoryRouter>
      </QueryClientProvider>,
      { createNodeMock },
    );
  });
  assert.ok(state.renderer);
  const root = state.renderer.root;
  return {
    root,
    dialog: () => root.findByType(GenericPopup).props,
    async dispose() {
      await act(async () => state.renderer?.unmount());
      client.clear();
    },
  };
};

const generalPopup = {
  mode: "create",
  initialTaskType: TASK_TYPES.GENERAL,
  project,
  onClose: noop,
  onCreated: noop,
} as const;

test("creation permission keeps pool selection available without exposing employee assignment", async () => {
  const user = { ...engineer, permissions: [PERMISSIONS.TASKS_CREATE] };
  setSession({ accessToken: "unit-test-token", user });
  const view = await renderPopup(generalPopup);
  const assignee = () =>
    view.root.findAllByType(Autocomplete).find(item => item.props.title === NEW_TASK_COPY.ASSIGNEE);
  try {
    assert.equal(assignee()?.props.items.length, 1);
    assert.match(assignee()?.props.items[0].label, /מאגר פתוח/);
    await act(async () =>
      setSession({
        accessToken: "unit-test-token",
        user: { ...user, permissions: [...user.permissions, PERMISSIONS.TASKS_ASSIGN] },
      }),
    );
    assert.equal(assignee()?.props.items.length, 2);
  } finally {
    await view.dispose();
    setSession(null);
  }
});

test("a protected slot makes the existing task available and prevents duplicate creation", async () => {
  const view = await renderPopup({ ...generalPopup, initialTaskType: TASK_TYPES.QUOTATION });
  try {
    assert.equal(view.dialog().buttons.primary.isDisabled, true);
    assert.ok(
      view.root
        .findAllByType(Button)
        .some(button => button.props.text === NEW_TASK_COPY.OPEN_EXISTING),
    );
  } finally {
    await view.dispose();
  }
});

test("saving from an apartment retains an invalid or failed draft and returns the created ID on retry", async () => {
  notifyManager.setScheduler(queueMicrotask);
  const oldAdapter = httpClient.defaults.adapter;
  const posts: unknown[] = [];
  const createdIds: string[] = [];
  const apartment = { ...project, id: "unit-4", parentProjectId: project.id, name: "דירה 4" };
  httpClient.defaults.adapter = async config => {
    assert.equal(config.method, "post");
    posts.push(JSON.parse(config.data));
    if (posts.length === 1) {
      throw new Error("Temporary save failure");
    }
    return {
      config,
      data: createTask({ projectId: apartment.id }),
      status: 201,
      statusText: "Created",
      headers: {},
    };
  };
  const view = await renderPopup({
    ...generalPopup,
    project: apartment,
    onCreated: id => createdIds.push(id),
  });
  const fields = () => view.root.findByType(TaskContentCard).props;
  const submit = () =>
    act(async () => {
      view.dialog().buttons.primary.onClick();
      await new Promise(resolve => setImmediate(resolve));
    });
  try {
    await submit();
    assert.equal(posts.length, 0);
    assert.equal(fields().errors.title, NEW_TASK_COPY.REQUIRED);
    await act(async () => fields().onChange({ title: "Fix", description: "Inspect" }));
    await submit();
    assert.equal(fields().values.title, "Fix");
    assert.deepEqual(createdIds, []);
    assert.equal(view.root.findAllByType(InlineError).length, 1);
    await submit();
    const payload = {
      projectId: apartment.id,
      taskType: TASK_TYPES.GENERAL,
      title: "Fix",
      description: "Inspect",
      dueDate: null,
      assigneeId: null,
    };
    assert.deepEqual(posts, [payload, payload]);
    assert.deepEqual(createdIds, ["task-1"]);
  } finally {
    await view.dispose();
    httpClient.defaults.adapter = oldAdapter;
    notifyManager.setScheduler(callback => setTimeout(callback, 0));
  }
});

test("the same popup edits a legacy task and sends only permitted changes on save", async () => {
  notifyManager.setScheduler(queueMicrotask);
  const oldAdapter = httpClient.defaults.adapter;
  const writes: unknown[] = [];
  const task = createTask({
    projectId: null,
    project: null,
    description: null,
    customerId: "legacy-customer",
    dueDate: "2020-01-01",
    taskType: TASK_TYPES.PLANNING,
  });
  const result = { closed: 0 };
  httpClient.defaults.adapter = async config => {
    assert.equal(config.method, "patch");
    writes.push(JSON.parse(config.data));
    return { config, data: task, status: 200, statusText: "OK", headers: {} };
  };
  const view = await renderPopup({
    mode: "edit",
    task,
    canEdit: true,
    canAssign: false,
    onClose: () => {
      result.closed += 1;
    },
  });
  const fields = view.root.findByType(TaskContentCard);
  try {
    assert.equal(view.dialog().title, NEW_TASK_COPY.EDIT_TITLE);
    assert.equal(view.dialog().buttons.primary.isDisabled, true);
    assert.equal(fields.props.values.dueDate, "2020-01-01");
    assert.equal(view.root.findByType(TaskTypeField).props.disabled, true);
    assert.equal(view.root.findAllByType(TaskUrgencyChoiceCard).length, 0);
    await act(async () =>
      fields.props.onChange({ title: " Updated ", assigneeOptionId: engineer.id }),
    );
    assert.deepEqual(writes, []);
    await act(async () => {
      view.dialog().buttons.primary.onClick();
      await new Promise(resolve => setImmediate(resolve));
    });
    assert.deepEqual(writes, [{ title: "Updated" }]);
    assert.equal(result.closed, 1);
  } finally {
    await view.dispose();
    httpClient.defaults.adapter = oldAdapter;
    notifyManager.setScheduler(callback => setTimeout(callback, 0));
  }
});

test("an urgent task with a failed urgency request retains its ID and retries only the urgency update", async () => {
  notifyManager.setScheduler(queueMicrotask);
  const oldAdapter = httpClient.defaults.adapter;
  const calls: string[] = [];
  const createdIds: string[] = [];
  httpClient.defaults.adapter = async config => {
    calls.push(`${config.method} ${config.url}`);
    if (calls.length === 2) {
      throw new Error("Urgency confirmation unavailable");
    }
    return { config, data: createTask(), status: 200, statusText: "OK", headers: {} };
  };
  setSession({
    accessToken: "unit-test-token",
    user: {
      ...engineer,
      permissions: [PERMISSIONS.TASKS_CREATE, PERMISSIONS.TASKS_URGENCY_CHANGE],
    },
  });
  const view = await renderPopup({ ...generalPopup, onCreated: id => createdIds.push(id) });
  try {
    await act(async () =>
      view.root
        .findByType(TaskContentCard)
        .props.onChange({ title: "Urgent", description: "Urgent work" }),
    );
    await act(async () => view.root.findByType(TaskUrgencyChoiceCard).props.onChange(true));
    await act(async () => {
      view.root.findByType(UrgencyConfirmPopup).props.onConfirm();
      await new Promise(resolve => setImmediate(resolve));
    });
    assert.deepEqual(calls, ["post /task", "patch /task/task-1/urgency"]);
    assert.deepEqual(createdIds, []);
    assert.equal(view.root.findAllByType(TaskContentCard).length, 0);
    assert.equal(view.dialog().buttons.primary.text, NEW_TASK_COPY.RETRY_URGENCY);
    await act(async () => {
      view.dialog().buttons.primary.onClick();
      await new Promise(resolve => setImmediate(resolve));
    });
    assert.deepEqual(calls, [
      "post /task",
      "patch /task/task-1/urgency",
      "patch /task/task-1/urgency",
    ]);
    assert.deepEqual(createdIds, ["task-1"]);
  } finally {
    await view.dispose();
    setSession(null);
    httpClient.defaults.adapter = oldAdapter;
    notifyManager.setScheduler(callback => setTimeout(callback, 0));
  }
});

test("a same-name assignee is identified by employee number and saved by their selected ID", async () => {
  const client = createClient();
  const second = { ...engineer, id: "engineer-2", employeeNumber: "EMP-2" };
  client.setQueryData(QUERY_KEYS.users(TASK_ASSIGNEES_QUERY), [engineer, second]);
  setSession({
    accessToken: "unit-test-token",
    user: { ...engineer, permissions: [PERMISSIONS.TASKS_CREATE, PERMISSIONS.TASKS_ASSIGN] },
  });
  const view = await renderPopup(generalPopup, client);
  const field = view.root
    .findAllByType(Autocomplete)
    .find(item => item.props.title === NEW_TASK_COPY.ASSIGNEE);
  const previousAdapter = httpClient.defaults.adapter;
  const assigneeIds: string[] = [];
  httpClient.defaults.adapter = async config => {
    assigneeIds.push(JSON.parse(config.data).assigneeId);
    return { config, data: createTask(), status: 201, statusText: "Created", headers: {} };
  };
  try {
    assert.ok(field);
    const [, firstOption, secondOption] = field.props.items;
    assert.equal(firstOption.label, secondOption.label);
    assert.equal(firstOption.subtitle, engineer.employeeNumber);
    assert.equal(secondOption.subtitle, second.employeeNumber);
    await act(async () => field.props.onChange(secondOption.value));
    assert.equal(field.props.selectedItem.value, second.id);
    await act(async () =>
      view.root
        .findByType(TaskContentCard)
        .props.onChange({ title: "Follow up", description: "Follow up at the site" }),
    );
    await act(async () => {
      view.dialog().buttons.primary.onClick();
      await new Promise(resolve => setImmediate(resolve));
    });
    assert.deepEqual(assigneeIds, [second.id]);
  } finally {
    await view.dispose();
    httpClient.defaults.adapter = previousAdapter;
    setSession(null);
  }
});
