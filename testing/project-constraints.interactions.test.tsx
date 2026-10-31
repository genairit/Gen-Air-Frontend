import {
  deferred,
  makeValues,
  constraintUser,
  createConstraintClient,
} from "./project-constraints.fixture";

import { useState } from "react";
import { AxiosError } from "axios";
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { MemoryRouter } from "react-router-dom";
import { project } from "./project-tasks.fixture";
import { setTimeout } from "node:timers/promises";
import { act, create } from "react-test-renderer";
import Switch from "../src/components/Switch/Switch";
import Button from "../src/components/Button/Button";
import { setSession } from "../src/store/session.store";
import { QueryClientProvider } from "@tanstack/react-query";
import TextField from "../src/components/TextField/TextField";
import { API_ENDPOINTS } from "../src/constants/api.constant";
import { httpClient } from "../src/services/http-client.service";
import { QUERY_ROOTS } from "../src/constants/query-key.constant";
import { SEARCH_DEBOUNCE_MS } from "../src/constants/search.constant";
import ProjectForm from "../src/pages/project-form/components/ProjectForm";
import { PROJECT_FORM_MODES } from "../src/constants/project-form.constant";
import type { IProjectFormValues } from "../src/interfaces/project.interface";
import { getProjectNameAvailability } from "../src/services/project-name.service";
import { useProjectNameAvailability } from "../src/hooks/queries/project-name.query";
import { PROJECT_CONSTRAINT_COPY } from "../src/constants/project-constraints.constant";
import ProjectDetailsCard from "../src/pages/project-form/components/ProjectDetailsCard";
import ProjectLightingFields from "../src/pages/project-form/components/ProjectLightingFields";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
const settle = () => setTimeout(20);
const rendererState = (): { renderer: ReturnType<typeof create> | null } => ({ renderer: null });

const createNodeMock = () => ({
  value: "",
  nodeName: "INPUT",
  focus: () => {},
  blur: () => {},
  setAttribute: () => {},
  removeAttribute: () => {},
  setSelectionRange: () => {},
});

test("availability service passes exact name, edit exclusion and abort signal, rejecting malformed responses", async () => {
  const signal = new AbortController().signal;
  const request = mock.method(
    httpClient,
    "get",
    async (
      url: string,
      config: { params: { name: string; excludeId: string | null }; signal: AbortSignal },
    ) => {
      assert.equal(url, API_ENDPOINTS.PROJECT_NAME_AVAILABILITY);
      assert.equal(config.params.name, "Case  Sensitive");
      assert.equal(config.params.excludeId, "own-project");
      assert.equal(config.signal, signal);
      return { data: { available: false } };
    },
  );
  try {
    assert.equal(
      await getProjectNameAvailability({
        name: "Case  Sensitive",
        excludeId: "own-project",
        signal,
      }),
      false,
    );
    request.mock.mockImplementation(async () => ({ data: { available: "yes" } }));
    await assert.rejects(getProjectNameAvailability({ name: "x", excludeId: null, signal }));
  } finally {
    request.mock.restore();
  }
});

test("availability service propagates forbidden responses rather than treating names as free", async () => {
  const forbidden = new AxiosError("forbidden");
  Reflect.set(forbidden, "response", { status: 403, data: {} });
  const request = mock.method(httpClient, "get", async () => {
    throw forbidden;
  });
  try {
    await assert.rejects(
      getProjectNameAvailability({
        name: "Name",
        excludeId: null,
        signal: new AbortController().signal,
      }),
      error => error === forbidden,
    );
  } finally {
    request.mock.restore();
  }
});

interface IProbeProps {
  name: string;
  excludeId: string | null;
  onSnapshot: (value: ReturnType<typeof useProjectNameAvailability>) => void;
}
const Probe = ({ name, excludeId, onSnapshot }: IProbeProps) => {
  const result = useProjectNameAvailability(name, excludeId);
  onSnapshot(result);
  return <div />;
};

test("blank names do not issue requests; trimmed names preserve case and internal spaces", async () => {
  const client = createConstraintClient();
  const state = rendererState();
  const snapshots: ReturnType<typeof useProjectNameAvailability>[] = [];
  const calls: string[] = [];
  const request = mock.method(
    httpClient,
    "get",
    async (_url: string, config: { params: { name: string } }) => {
      calls.push(config.params.name);
      return { data: { available: true } };
    },
  );
  const onSnapshot = (value: ReturnType<typeof useProjectNameAvailability>) =>
    snapshots.push(value);
  const element = (name: string) => (
    <QueryClientProvider client={client}>
      <Probe name={name} excludeId={null} onSnapshot={onSnapshot} />
    </QueryClientProvider>
  );
  try {
    await act(async () => {
      state.renderer = create(element("   "));
      await settle();
    });
    assert.deepEqual(calls, []);
    assert.equal(snapshots.at(-1)?.isPending, false);
    await act(async () => state.renderer?.update(element("  Mixed  CASE  ")));
    assert.equal(snapshots.at(-1)?.isPending, true);
    await act(async () => {
      await setTimeout(SEARCH_DEBOUNCE_MS + 30);
    });
    await act(settle);
    assert.deepEqual(calls, ["Mixed  CASE"]);
    assert.equal(snapshots.at(-1)?.isPending, false);
  } finally {
    await act(async () => state.renderer?.unmount());
    client.clear();
    request.mock.restore();
  }
});

test("changing a name hides stale duplicate feedback while checking the new scope", async () => {
  const client = createConstraintClient();
  const state = rendererState();
  const snapshots: ReturnType<typeof useProjectNameAvailability>[] = [];
  const request = mock.method(
    httpClient,
    "get",
    async (_url: string, config: { params: { name: string } }) => ({
      data: { available: config.params.name !== "Taken" },
    }),
  );
  const onSnapshot = (value: ReturnType<typeof useProjectNameAvailability>) =>
    snapshots.push(value);
  const element = (name: string) => (
    <QueryClientProvider client={client}>
      <Probe name={name} excludeId="own-id" onSnapshot={onSnapshot} />
    </QueryClientProvider>
  );
  try {
    await act(async () => {
      state.renderer = create(element("Taken"));
      await settle();
    });
    await act(settle);
    assert.equal(snapshots.at(-1)?.isTaken, true);
    await act(async () => state.renderer?.update(element("Available")));
    assert.equal(snapshots.at(-1)?.isTaken, false);
    assert.equal(snapshots.at(-1)?.isPending, true);
    await act(async () => {
      await setTimeout(SEARCH_DEBOUNCE_MS + 30);
    });
    await act(settle);
    assert.equal(snapshots.at(-1)?.isTaken, false);
    assert.equal(snapshots.at(-1)?.isError, false);
  } finally {
    await act(async () => state.renderer?.unmount());
    client.clear();
    request.mock.restore();
  }
});

test("availability failure stays failed until explicit retry succeeds", async () => {
  const client = createConstraintClient();
  const state = rendererState();
  const snapshots: ReturnType<typeof useProjectNameAvailability>[] = [];
  const request = mock.method(httpClient, "get", async () => {
    throw new Error("offline");
  });
  try {
    await act(async () => {
      state.renderer = create(
        <QueryClientProvider client={client}>
          <Probe name="Name" excludeId={null} onSnapshot={value => snapshots.push(value)} />
        </QueryClientProvider>,
      );
      await settle();
    });
    await act(settle);
    assert.equal(snapshots.at(-1)?.isError, true);
    assert.equal(request.mock.callCount(), 1);
    request.mock.mockImplementation(async () => ({ data: { available: true } }));
    await act(async () => {
      await snapshots.at(-1)?.retry();
    });
    await act(settle);
    assert.equal(snapshots.at(-1)?.isError, false);
    assert.equal(snapshots.at(-1)?.isTaken, false);
  } finally {
    await act(async () => state.renderer?.unmount());
    client.clear();
    request.mock.restore();
  }
});

test("switching edit IDs isolates availability cache and cancels the abandoned request", async () => {
  const client = createConstraintClient();
  const state = rendererState();
  const first = deferred<{ data: { available: boolean } }>();
  const signals: AbortSignal[] = [];
  const ids: string[] = [];
  const snapshots: ReturnType<typeof useProjectNameAvailability>[] = [];
  const request = mock.method(
    httpClient,
    "get",
    async (_url: string, config: { params: { excludeId: string }; signal: AbortSignal }) => {
      ids.push(config.params.excludeId);
      signals.push(config.signal);
      return config.params.excludeId === "first" ? first.promise : { data: { available: true } };
    },
  );
  const element = (id: string) => (
    <QueryClientProvider client={client}>
      <Probe name="Same" excludeId={id} onSnapshot={value => snapshots.push(value)} />
    </QueryClientProvider>
  );
  try {
    await act(async () => {
      state.renderer = create(element("first"));
      await settle();
    });
    await act(async () => {
      state.renderer?.update(element("second"));
      await settle();
    });
    await act(settle);
    assert.deepEqual(ids, ["first", "second"]);
    assert.equal(signals[0].aborted, true);
    first.resolve({ data: { available: false } });
    await act(settle);
    assert.equal(snapshots.at(-1)?.isTaken, false);
  } finally {
    await act(async () => state.renderer?.unmount());
    client.clear();
    request.mock.restore();
  }
});

const LightingHarness = ({
  initial,
  submitted = false,
}: {
  initial: IProjectFormValues;
  submitted?: boolean;
}) => {
  const [values, setValues] = useState(initial);
  return (
    <ProjectLightingFields
      values={values}
      isSubmitAttempted={submitted}
      onChange={changes => setValues(current => ({ ...current, ...changes }))}
    />
  );
};

test("lighting toggle reveals a required centimeter field and disabling clears entered height", async () => {
  const state = rendererState();
  try {
    await act(async () => {
      state.renderer = create(<LightingHarness initial={makeValues()} />, { createNodeMock });
    });
    const renderer = state.renderer;
    assert.ok(renderer);
    assert.equal(renderer.root.findAllByType(TextField).length, 0);
    const switchButton = renderer.root
      .findAllByType("button")
      .find(button => button.props.role === "switch");
    assert.ok(switchButton);
    assert.equal(switchButton.props.type, "button");
    assert.equal(switchButton.props["aria-checked"], false);
    assert.equal(switchButton.props["aria-label"], PROJECT_CONSTRAINT_COPY.LIGHTING_TITLE);
    assert.equal(
      renderer.root.findByType(Switch).props.ariaLabel,
      PROJECT_CONSTRAINT_COPY.LIGHTING_TITLE,
    );
    await act(async () => renderer.root.findByType(Switch).props.onChange(true));
    const field = renderer.root.findByType(TextField);
    assert.equal(field.props.isRequired, true);
    assert.equal(field.props.infoText, PROJECT_CONSTRAINT_COPY.HEIGHT_HINT);
    await act(async () => field.props.onChange("25.5"));
    assert.equal(renderer.root.findByType(TextField).props.value, "25.5");
    await act(async () => renderer.root.findByType(Switch).props.onChange(false));
    await act(async () => renderer.root.findByType(Switch).props.onChange(true));
    assert.equal(renderer.root.findByType(TextField).props.value, "");
  } finally {
    await act(async () => state.renderer?.unmount());
  }
});

test("missing and invalid height feedback follow submit or edit while saved zero remains valid", async () => {
  const state = rendererState();
  const initial = { ...makeValues(), hasGeneralLightingCeilingLowering: true };
  try {
    await act(async () => {
      state.renderer = create(<LightingHarness submitted initial={initial} />, { createNodeMock });
    });
    const renderer = state.renderer;
    assert.ok(renderer);
    assert.equal(
      renderer.root.findByType(TextField).props.validator("").errorText,
      PROJECT_CONSTRAINT_COPY.HEIGHT_REQUIRED,
    );
    await act(async () => renderer.root.findByType(TextField).props.onChange("wrong"));
    assert.equal(
      renderer.root.findByType(TextField).props.validator("wrong").errorText,
      PROJECT_CONSTRAINT_COPY.HEIGHT_INVALID,
    );
    await act(async () => renderer.root.findByType(TextField).props.onChange("0"));
    assert.equal(renderer.root.findByType(TextField).props.validator("0").isValid, true);
  } finally {
    await act(async () => state.renderer?.unmount());
  }
});

test("project details puts the domain duplicate message on the name field and exposes retry for failed checks", async () => {
  const state = rendererState();
  const retry = mock.fn();
  setSession({ accessToken: "test-token", user: constraintUser });
  try {
    await act(async () => {
      state.renderer = create(
        <ProjectDetailsCard
          stages={[]}
          projectCode="GA-1"
          onChange={() => {}}
          namePending={false}
          values={makeValues()}
          nameCheckFailed={true}
          onRetryNameCheck={retry}
          isSubmitAttempted={false}
          mode={PROJECT_FORM_MODES.EDIT}
          nameError={PROJECT_CONSTRAINT_COPY.DUPLICATE_NAME}
        />,
        { createNodeMock },
      );
    });
    const renderer = state.renderer;
    assert.ok(renderer);
    const name = renderer.root
      .findAllByType(TextField)
      .find(field => field.props.title?.includes("כותרת"));
    assert.ok(name);
    assert.equal(name.props.validator("Taken").errorText, PROJECT_CONSTRAINT_COPY.DUPLICATE_NAME);
    const button = renderer.root
      .findAllByType(Button)
      .find(item => item.props.text === PROJECT_CONSTRAINT_COPY.RETRY);
    assert.ok(button);
    await act(async () => button.props.onClick());
    assert.equal(retry.mock.callCount(), 1);
  } finally {
    await act(async () => state.renderer?.unmount());
    setSession(null);
  }
});

test("project form prevents duplicate or pending names from submitting despite direct click invocation", async () => {
  const client = createConstraintClient();
  const state = rendererState();
  const availability = deferred<{ data: { available: boolean } }>();
  const request = mock.method(httpClient, "get", async () => availability.promise);
  const patch = mock.method(httpClient, "patch", async () => {
    throw new Error("must not submit");
  });
  setSession({ accessToken: "test-token", user: constraintUser });
  try {
    await act(async () => {
      state.renderer = create(
        <QueryClientProvider client={client}>
          <MemoryRouter>
            <ProjectForm project={project} mode={PROJECT_FORM_MODES.EDIT} />
          </MemoryRouter>
        </QueryClientProvider>,
        { createNodeMock },
      );
    });
    const renderer = state.renderer;
    assert.ok(renderer);
    const save = () =>
      renderer.root.findAllByType(Button).find(item => item.props.text === "שמור שינויים");
    assert.equal(save()?.props.disabled, true);
    await act(async () => save()?.props.onClick());
    assert.equal(patch.mock.callCount(), 0);
    availability.resolve({ data: { available: false } });
    await act(settle);
    assert.equal(
      renderer.root.findByType(ProjectDetailsCard).props.nameError,
      PROJECT_CONSTRAINT_COPY.DUPLICATE_NAME,
    );
    assert.equal(save()?.props.disabled, true);
    await act(async () => save()?.props.onClick());
    assert.equal(patch.mock.callCount(), 0);
  } finally {
    await act(async () => state.renderer?.unmount());
    client.clear();
    request.mock.restore();
    patch.mock.restore();
    setSession(null);
  }
});

test("server race conflict becomes inline name feedback and does not follow the user to another name", async () => {
  const client = createConstraintClient();
  const state = rendererState();
  const request = mock.method(httpClient, "get", async () => ({ data: { available: true } }));
  const conflict = new AxiosError("duplicate");
  Reflect.set(conflict, "response", {
    status: 409,
    data: { code: "PROJECT_NAME_ALREADY_EXISTS", message: "duplicate" },
  });
  const patch = mock.method(httpClient, "patch", async () => {
    throw conflict;
  });
  setSession({ accessToken: "test-token", user: constraintUser });
  try {
    await act(async () => {
      state.renderer = create(
        <QueryClientProvider client={client}>
          <MemoryRouter>
            <ProjectForm project={project} mode={PROJECT_FORM_MODES.EDIT} />
          </MemoryRouter>
        </QueryClientProvider>,
        { createNodeMock },
      );
      await settle();
    });
    await act(settle);
    const renderer = state.renderer;
    assert.ok(renderer);
    const save = renderer.root
      .findAllByType(Button)
      .find(item => item.props.text === "שמור שינויים");
    assert.ok(save);
    assert.equal(save.props.disabled, false);
    await act(async () => {
      save.props.onClick();
      await settle();
    });
    await act(settle);
    assert.equal(patch.mock.callCount(), 1);
    assert.equal(
      renderer.root.findByType(ProjectDetailsCard).props.nameError,
      PROJECT_CONSTRAINT_COPY.DUPLICATE_NAME,
    );
    await act(async () =>
      renderer.root.findByType(ProjectDetailsCard).props.onChange({ name: "Another exact name" }),
    );
    assert.equal(renderer.root.findByType(ProjectDetailsCard).props.nameError, "");
    assert.equal(renderer.root.findByType(ProjectDetailsCard).props.namePending, true);
  } finally {
    await act(async () => state.renderer?.unmount());
    client.clear();
    request.mock.restore();
    patch.mock.restore();
    setSession(null);
  }
});

test("a cleared race conflict does not resurrect when the original name becomes available", async () => {
  const client = createConstraintClient();
  client.setQueryDefaults([QUERY_ROOTS.PROJECT_NAME_AVAILABILITY], { staleTime: 0 });
  const state = rendererState();
  const checkedNames: string[] = [];
  const request = mock.method(
    httpClient,
    "get",
    async (_url: string, config: { params: { name: string } }) => {
      checkedNames.push(config.params.name);
      return { data: { available: true } };
    },
  );
  const conflict = new AxiosError("duplicate");
  Reflect.set(conflict, "response", {
    status: 409,
    data: { code: "PROJECT_NAME_ALREADY_EXISTS", message: "duplicate" },
  });
  const patch = mock.method(httpClient, "patch", async () => {
    throw conflict;
  });
  setSession({ accessToken: "test-token", user: constraintUser });
  try {
    await act(async () => {
      state.renderer = create(
        <QueryClientProvider client={client}>
          <MemoryRouter>
            <ProjectForm project={project} mode={PROJECT_FORM_MODES.EDIT} />
          </MemoryRouter>
        </QueryClientProvider>,
        { createNodeMock },
      );
      await settle();
    });
    await act(settle);
    const renderer = state.renderer;
    assert.ok(renderer);
    const save = () =>
      renderer.root.findAllByType(Button).find(item => item.props.text === "שמור שינויים");
    assert.equal(save()?.props.disabled, false);
    await act(async () => {
      save()?.props.onClick();
      await settle();
    });
    await act(settle);
    assert.equal(patch.mock.callCount(), 1);
    assert.equal(
      renderer.root.findByType(ProjectDetailsCard).props.nameError,
      PROJECT_CONSTRAINT_COPY.DUPLICATE_NAME,
    );
    await act(async () =>
      renderer.root
        .findByType(ProjectDetailsCard)
        .props.onChange({ name: "Available alternative" }),
    );
    assert.equal(renderer.root.findByType(ProjectDetailsCard).props.nameError, "");
    await act(async () => {
      await setTimeout(SEARCH_DEBOUNCE_MS + 30);
    });
    await act(settle);
    await act(async () =>
      renderer.root.findByType(ProjectDetailsCard).props.onChange({ name: project.name }),
    );
    await act(async () => {
      await setTimeout(SEARCH_DEBOUNCE_MS + 30);
    });
    await act(settle);
    assert.equal(checkedNames.filter(name => name === project.name).length, 2);
    assert.equal(renderer.root.findByType(ProjectDetailsCard).props.namePending, false);
    assert.equal(renderer.root.findByType(ProjectDetailsCard).props.nameError, "");
    assert.equal(save()?.props.disabled, false);
  } finally {
    await act(async () => state.renderer?.unmount());
    client.clear();
    request.mock.restore();
    patch.mock.restore();
    setSession(null);
  }
});
