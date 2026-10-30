import {
  noop,
  project,
  engineer,
  createTask,
  formValues,
  createClient,
} from "./project-tasks.fixture";

import moment from "moment";
import { test } from "node:test";
import { AxiosError } from "axios";
import assert from "node:assert/strict";
import { MemoryRouter } from "react-router-dom";
import { act, create } from "react-test-renderer";
import Button from "../src/components/Button/Button";
import { setSession } from "../src/store/session.store";
import TextField from "../src/components/TextField/TextField";
import { DATE_FORMAT } from "../src/constants/date.constants";
import { httpClient } from "../src/services/http-client.service";
import { QUERY_KEYS } from "../src/constants/query-key.constant";
import { TASK_TYPES } from "../src/constants/task-type.constant";
import { PERMISSIONS } from "../src/constants/permission.constant";
import Autocomplete from "../src/components/Autocomplete/Autocomplete";
import NewTaskForm from "../src/pages/task-form/components/NewTaskForm";
import { QueryClientProvider, notifyManager } from "@tanstack/react-query";
import TaskDetailsCard from "../src/pages/task/components/TaskDetailsCard";
import type { TUpdateTaskPayload } from "../src/interfaces/task.interface";
import TaskContentCard from "../src/pages/task-form/components/TaskContentCard";
import { NEW_TASK_COPY, POOL_ASSIGNEE_ID } from "../src/constants/task.constant";
import TaskLinkSelection from "../src/pages/task-form/components/TaskLinkSelection";
import TaskAssignmentCard from "../src/pages/task-form/components/TaskAssignmentCard";
import { FIELD_TYPES } from "../src/components/TextField/constants/textfield.constants";
import TaskLinkSelectionStatus from "../src/pages/task-form/components/TaskLinkSelectionStatus";

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
    const date = fields.find(field => field.props.type === FIELD_TYPES.DATE);
    assert.ok(date);
    assert.notEqual(date.props.isRequired, true);
    assert.equal(date.props.value, "");
    assert.equal(fields.filter(field => field.props.isRequired === true).length, 2);
    assert.equal(date.props.validator("").errorText, "");
  } finally {
    await act(async () => state.renderer?.unmount());
  }
});

test("assignment permission keeps pool selection available without exposing employee assignment", async () => {
  const client = createClient();
  const state: { renderer: ReturnType<typeof create> | null } = { renderer: null };
  const user = { ...engineer, permissions: [PERMISSIONS.TASKS_CREATE] };
  setSession({ accessToken: "unit-test-token", user });
  try {
    await act(async () => {
      state.renderer = create(
        <QueryClientProvider client={client}>
          <MemoryRouter>
            <TaskAssignmentCard
              errors={{}}
              onChange={noop}
              values={formValues}
              onLinkChange={noop}
            />
          </MemoryRouter>
        </QueryClientProvider>,
        { createNodeMock },
      );
    });
    const renderer = state.renderer;
    assert.ok(renderer);
    const field = renderer.root.findByType(Autocomplete);
    assert.equal(field.props.options.length, 1);
    assert.ok(field.props.options[0].includes("מאגר פתוח"));
    await act(async () =>
      setSession({
        accessToken: "unit-test-token",
        user: { ...user, permissions: [PERMISSIONS.TASKS_CREATE, PERMISSIONS.TASKS_ASSIGN] },
      }),
    );
    assert.equal(renderer.root.findByType(Autocomplete).props.options.length, 2);
  } finally {
    await act(async () => state.renderer?.unmount());
    setSession(null);
    client.clear();
  }
});

test("protected task edits allow date clearing and assignment without an invented date, but reject past dates", async () => {
  const client = createClient();
  const changes: TUpdateTaskPayload[] = [];
  const task = createTask({ taskType: TASK_TYPES.QUOTATION });
  const state: { renderer: ReturnType<typeof create> | null } = { renderer: null };
  try {
    await act(async () => {
      state.renderer = create(
        <QueryClientProvider client={client}>
          <MemoryRouter>
            <TaskDetailsCard
              canEdit
              canAssign
              task={task}
              onClaim={noop}
              canClaim={false}
              isSaving={false}
              onUpdate={payload => changes.push(payload)}
            />
          </MemoryRouter>
        </QueryClientProvider>,
        { createNodeMock },
      );
    });
    const renderer = state.renderer;
    assert.ok(renderer);
    const date = renderer.root
      .findAllByType(TextField)
      .find(field => field.props.type === FIELD_TYPES.DATE);
    assert.ok(date);
    assert.equal(date.props.value, "");
    await act(async () => date.props.onChange(""));
    assert.deepEqual(changes, [{ dueDate: null }]);
    await act(async () =>
      date.props.onChange(moment().subtract(1, "day").format(DATE_FORMAT.DATE_INPUT)),
    );
    await act(async () => date.props.onChange("invalid-date"));
    assert.equal(changes.length, 1);
    const tomorrow = moment().add(1, "day").format(DATE_FORMAT.DATE_INPUT);
    await act(async () => date.props.onChange(tomorrow));
    assert.deepEqual(changes, [{ dueDate: null }, { dueDate: tomorrow }]);
    const assignee = renderer.root.findByType(Autocomplete);
    const engineerLabel = assignee.props.options.find(
      (label: string) => label === `${engineer.firstName} ${engineer.lastName}`,
    );
    assert.ok(engineerLabel);
    await act(async () => assignee.props.onChange(engineerLabel));
    assert.deepEqual(changes.at(-1), { assigneeId: engineer.id });
    assert.ok(changes.every(payload => !("taskType" in payload) && !("projectId" in payload)));
  } finally {
    await act(async () => state.renderer?.unmount());
    client.clear();
  }
});

test("an unavailable initial project remains selected and blocks submission instead of silently creating an unlinked task", async () => {
  const client = createClient();
  const projectId = "unavailable-project";
  client.setQueryDefaults(QUERY_KEYS.project(projectId), {
    retryOnMount: false,
    refetchOnMount: false,
  });
  await assert.rejects(
    client.fetchQuery({
      queryKey: QUERY_KEYS.project(projectId),
      queryFn: async () => {
        throw new Error("Project not found");
      },
    }),
    /Project not found/,
  );
  const requests: string[] = [];
  const previousAdapter = httpClient.defaults.adapter;
  httpClient.defaults.adapter = async config => {
    requests.push(config.url ?? "");
    throw new Error("Unexpected network request in cached unit fixture");
  };
  const state: { renderer: ReturnType<typeof create> | null } = { renderer: null };
  setSession({
    accessToken: "unit-test-token",
    user: { ...engineer, permissions: [PERMISSIONS.TASKS_CREATE] },
  });
  try {
    await act(async () => {
      state.renderer = create(
        <QueryClientProvider client={client}>
          <MemoryRouter>
            <NewTaskForm initialProject={null} initialProjectId={projectId} />
          </MemoryRouter>
        </QueryClientProvider>,
        { createNodeMock },
      );
    });
    const renderer = state.renderer;
    assert.ok(renderer);
    await act(async () => {
      renderer.root
        .findByType(TaskContentCard)
        .props.onChange({ title: "משימה כללית", description: "תיאור עבודה" });
      renderer.root
        .findByType(TaskAssignmentCard)
        .props.onChange({ assigneeOptionId: POOL_ASSIGNEE_ID });
    });
    assert.equal(renderer.root.findByType(TaskAssignmentCard).props.values.projectId, projectId);
    assert.equal(renderer.root.findByType(TaskLinkSelectionStatus).props.isError, true);
    const submit = renderer.root
      .findAllByType(Button)
      .find(button => button.props.text === NEW_TASK_COPY.SAVE);
    assert.ok(submit);
    assert.equal(submit.props.disabled, true);
    await act(async () => submit.props.onClick());
    assert.deepEqual(requests, []);
  } finally {
    await act(async () => state.renderer?.unmount());
    httpClient.defaults.adapter = previousAdapter;
    setSession(null);
    client.clear();
  }
});

test("cached project refetch failure exposes retry and blocks save until recovery without losing the form", async () => {
  notifyManager.setScheduler(queueMicrotask);
  const client = createClient();
  const state: { renderer: ReturnType<typeof create> | null; failing: boolean; posts: string[] } = {
    renderer: null,
    failing: true,
    posts: [],
  };
  const previousAdapter = httpClient.defaults.adapter;
  httpClient.defaults.adapter = async config => {
    if (config.method === "post") {
      state.posts.push(typeof config.data === "string" ? config.data : "");
      return { config, data: createTask(), status: 201, statusText: "Created", headers: {} };
    }
    if (state.failing) {
      throw new AxiosError("Project unavailable", "ERR_BAD_RESPONSE", config, null, {
        config,
        status: 503,
        statusText: "Unavailable",
        headers: {},
        data: { message: "Project unavailable" },
      });
    }
    return { config, data: project, status: 200, statusText: "OK", headers: {} };
  };
  setSession({
    accessToken: "unit-test-token",
    user: { ...engineer, permissions: [PERMISSIONS.TASKS_CREATE] },
  });
  try {
    await act(async () => {
      state.renderer = create(
        <QueryClientProvider client={client}>
          <MemoryRouter>
            <NewTaskForm initialProject={project} initialProjectId={project.id} />
          </MemoryRouter>
        </QueryClientProvider>,
        { createNodeMock },
      );
    });
    const renderer = state.renderer;
    assert.ok(renderer);
    await act(async () =>
      renderer.root
        .findByType(TaskContentCard)
        .props.onChange({ title: "תיאור שנשמר בטופס", description: "עבודה כללית לפרויקט" }),
    );
    assert.equal(renderer.root.findAllByType(TaskLinkSelection).length, 1);
    await act(async () => {
      await assert.rejects(
        client.refetchQueries(
          { queryKey: QUERY_KEYS.project(project.id), exact: true },
          { throwOnError: true },
        ),
        /Project unavailable/,
      );
      await new Promise(resolve => setImmediate(resolve));
    });
    assert.deepEqual(client.getQueryData(QUERY_KEYS.project(project.id)), project);
    assert.equal(client.getQueryState(QUERY_KEYS.project(project.id))?.status, "error");
    assert.equal(renderer.root.findAllByType(TaskLinkSelection).length, 0);
    const errorStatus = renderer.root.findByType(TaskLinkSelectionStatus);
    assert.equal(errorStatus.props.isError, true);
    const submit = renderer.root
      .findAllByType(Button)
      .find(button => button.props.text === NEW_TASK_COPY.SAVE);
    assert.ok(submit);
    assert.equal(submit.props.disabled, true);
    await act(async () => submit.props.onClick());
    assert.deepEqual(state.posts, []);
    state.failing = false;
    await act(async () => {
      await errorStatus.props.onRetry();
      await new Promise(resolve => setImmediate(resolve));
    });
    assert.equal(renderer.root.findAllByType(TaskLinkSelectionStatus).length, 0);
    assert.equal(renderer.root.findAllByType(TaskLinkSelection).length, 1);
    assert.equal(renderer.root.findByType(TaskContentCard).props.values.title, "תיאור שנשמר בטופס");
    const recoveredSubmit = renderer.root
      .findAllByType(Button)
      .find(button => button.props.text === NEW_TASK_COPY.SAVE);
    assert.ok(recoveredSubmit);
    assert.equal(recoveredSubmit.props.disabled, false);
    await act(async () => {
      recoveredSubmit.props.onClick();
      await new Promise(resolve => setImmediate(resolve));
    });
    assert.equal(state.posts.length, 1);
    assert.deepEqual(JSON.parse(state.posts[0]), {
      projectId: project.id,
      taskType: TASK_TYPES.GENERAL,
      title: "תיאור שנשמר בטופס",
      description: "עבודה כללית לפרויקט",
      dueDate: null,
      assigneeId: null,
    });
  } finally {
    await act(async () => state.renderer?.unmount());
    httpClient.defaults.adapter = previousAdapter;
    setSession(null);
    client.clear();
    notifyManager.setScheduler(callback => setTimeout(callback, 0));
  }
});
