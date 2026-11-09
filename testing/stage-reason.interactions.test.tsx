import {
  STAGE_REASON_COPY,
  WAITING_FOR_RESPONSE_STAGE_ID,
} from "../src/constants/project-stage.constant";

import assert from "node:assert/strict";
import { test, mock, after } from "node:test";
import { AxiosError, AxiosHeaders } from "axios";
import { project } from "./project-tasks.fixture";
import { setTimeout } from "node:timers/promises";
import { act, create } from "react-test-renderer";
import { setSession } from "../src/store/session.store";
import { logger } from "../src/utilities/logger.utility";
import { API_ENDPOINTS } from "../src/constants/api.constant";
import { constraintUser } from "./project-constraints.fixture";
import { QUERY_KEYS } from "../src/constants/query-key.constant";
import { httpClient } from "../src/services/http-client.service";
import { PERMISSIONS } from "../src/constants/permission.constant";
import InlineError from "../src/components/InlineError/InlineError";
import { installDomEventTargets } from "./dom-event-targets.utility";
import Autocomplete from "../src/components/Autocomplete/Autocomplete";
import GenericPopup from "../src/components/GenericPopup/GenericPopup";
import { toProjectFormValues } from "../src/utilities/project.utility";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PROJECT_FORM_MODES } from "../src/constants/project-form.constant";
import StageReasonPopup from "../src/components/StageReasonPopup/StageReasonPopup";
import StageReasonField from "../src/components/StageReasonPopup/StageReasonField";
import ProjectStageSelector from "../src/pages/project/components/ProjectStageSelector";
import ProjectDetailsCard from "../src/pages/project-form/components/ProjectDetailsCard";
import ApartmentSelectionBar from "../src/pages/project/components/building/ApartmentSelectionBar";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
after(installDomEventTargets());
Reflect.set(Reflect.get(globalThis, "window"), "getComputedStyle", () => ({
  width: "100px",
  boxSizing: "border-box",
  paddingBottom: "0px",
  paddingTop: "0px",
  borderBottomWidth: "0px",
  borderTopWidth: "0px",
}));
Reflect.set(globalThis, "cancelAnimationFrame", () => {});
after(() => Reflect.deleteProperty(globalThis, "cancelAnimationFrame"));

const REASON = "ממתינים לאישור התוכנית מהאדריכל";
const settle = () => setTimeout(20);

const stages = [
  { id: "draft-stage", name: "טיוטה", position: 0, tag: null, color: null, description: null },
  {
    id: WAITING_FOR_RESPONSE_STAGE_ID,
    name: "מחכה לתשובה",
    position: 1,
    tag: null,
    color: null,
    description: null,
  },
  { id: "done-stage", name: "הושלם", position: 2, tag: null, color: null, description: null },
];

const createNodeMock = () => ({
  value: "",
  style: {},
  scrollHeight: 20,
  nodeName: "TEXTAREA",
  focus: () => {},
  blur: () => {},
  setAttribute: () => {},
  removeAttribute: () => {},
  setSelectionRange: () => {},
});

const render = async (element: React.ReactElement) => {
  const state: { renderer: ReturnType<typeof create> | null } = { renderer: null };
  await act(async () => {
    state.renderer = create(element, { createNodeMock });
  });
  assert.ok(state.renderer);
  return state.renderer;
};

const getPrimary = (renderer: ReturnType<typeof create>) =>
  renderer.root.findByType(GenericPopup).props.buttons.primary;

const getSecondary = (renderer: ReturnType<typeof create>) =>
  renderer.root.findByType(GenericPopup).props.buttons.secondary;

const typeReason = (renderer: ReturnType<typeof create>, value: string) =>
  act(async () => renderer.root.findByType(StageReasonField).props.onChange(value));

const waitingReasonError = () =>
  new AxiosError("Bad Request", "ERR_BAD_REQUEST", undefined, undefined, {
    status: 400,
    statusText: "Bad Request",
    headers: {},
    config: { headers: new AxiosHeaders() },
    data: { code: "WAITING_REASON_REQUIRED", message: "יש להזין סיבה" },
  });

test("the reason popup requires non-blank text, trims it and reveals errors only after typing", async () => {
  const confirmations: string[] = [];
  const cancels = mock.fn();
  const renderer = await render(
    <StageReasonPopup
      open
      title="title"
      onCancel={cancels}
      contextText="context"
      onConfirm={async note => {
        confirmations.push(note);
      }}
    />,
  );

  try {
    const field = () => renderer.root.findByType(StageReasonField);
    assert.equal(getPrimary(renderer).isDisabled, true);
    assert.equal(field().props.isErrorRevealed, false);
    assert.equal(field().props.autoFocus, true);

    await typeReason(renderer, "   ");
    assert.equal(getPrimary(renderer).isDisabled, true);
    assert.equal(field().props.isErrorRevealed, true);
    assert.ok(JSON.stringify(renderer.toJSON()).includes(STAGE_REASON_COPY.REQUIRED_ERROR));

    await typeReason(renderer, `  ${REASON}  `);
    assert.equal(getPrimary(renderer).isDisabled, false);
    await act(async () => getPrimary(renderer).onClick());
    assert.deepEqual(confirmations, [REASON]);
    assert.equal(field().props.value, "");

    await typeReason(renderer, "draft");
    await act(async () => getSecondary(renderer).onClick());
    assert.equal(cancels.mock.callCount(), 1);
    assert.equal(field().props.value, "");
  } finally {
    await act(async () => renderer.unmount());
  }
});

test("a failed confirmation keeps the popup text and shows the server error for retry", async () => {
  const errorLog = mock.method(logger, "error", () => {});
  const renderer = await render(
    <StageReasonPopup
      open
      title="title"
      onCancel={() => {}}
      contextText="context"
      onConfirm={async () => {
        throw waitingReasonError();
      }}
    />,
  );

  try {
    await typeReason(renderer, REASON);
    await act(async () => getPrimary(renderer).onClick());

    assert.equal(renderer.root.findByType(StageReasonField).props.value, REASON);
    assert.equal(getPrimary(renderer).isDisabled, false);
    assert.equal(renderer.root.findAllByType(InlineError).length, 1);
    assert.match(renderer.root.findByType(InlineError).props.message, /יש להזין סיבה/);
    assert.equal(errorLog.mock.callCount(), 1);
  } finally {
    errorLog.mock.restore();
    await act(async () => renderer.unmount());
  }
});

test("the header selector opens the popup for waiting and moves other stages directly", async () => {
  setSession({ accessToken: "test-token", user: constraintUser });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: Infinity } },
  });
  client.setQueryData(QUERY_KEYS.PROJECT_STAGES, stages);
  const patch = mock.method(httpClient, "patch", async () => ({ data: project }));
  const current = { ...project, stage: stages[0] };
  const renderer = await render(
    <QueryClientProvider client={client}>
      <ProjectStageSelector project={current} />
    </QueryClientProvider>,
  );

  try {
    const choose = (name: string) =>
      act(async () => renderer.root.findByType(Autocomplete).props.onChange(name));
    const isOpen = () => renderer.root.findByType(StageReasonPopup).props.open;

    await choose("טיוטה");
    assert.equal(patch.mock.callCount(), 0);

    await choose("מחכה לתשובה");
    assert.equal(isOpen(), true);
    assert.equal(patch.mock.callCount(), 0);
    assert.equal(renderer.root.findByType(Autocomplete).props.value, "טיוטה");

    await act(async () => getSecondary(renderer).onClick());
    assert.equal(isOpen(), false);
    assert.equal(patch.mock.callCount(), 0);

    await choose("מחכה לתשובה");
    await typeReason(renderer, ` ${REASON} `);
    await act(async () => {
      await getPrimary(renderer).onClick();
      await settle();
    });
    assert.equal(isOpen(), false);
    assert.deepEqual(patch.mock.calls[0].arguments, [
      API_ENDPOINTS.projectStage(project.id),
      { stageId: WAITING_FOR_RESPONSE_STAGE_ID, note: REASON },
    ]);

    await choose("הושלם");
    await act(settle);
    assert.deepEqual(patch.mock.calls[1].arguments, [
      API_ENDPOINTS.projectStage(project.id),
      { stageId: "done-stage" },
    ]);
  } finally {
    patch.mock.restore();
    await act(async () => renderer.unmount());
  }
});

test("the edit form shows the inline reason only while changing into waiting", async () => {
  setSession({
    accessToken: "test-token",
    user: { ...constraintUser, permissions: [PERMISSIONS.PROJECTS_STATUS_CHANGE] },
  });
  const values = toProjectFormValues(project);
  const renderCard = (changes: Partial<typeof values>, isSubmitAttempted = false) => (
    <ProjectDetailsCard
      nameError=""
      stages={stages}
      projectCode="GA-1"
      onChange={() => {}}
      namePending={false}
      nameCheckFailed={false}
      onRetryNameCheck={() => {}}
      originalStageId="draft-stage"
      mode={PROJECT_FORM_MODES.EDIT}
      values={{ ...values, ...changes }}
      isSubmitAttempted={isSubmitAttempted}
    />
  );
  const renderer = await render(renderCard({}));

  try {
    assert.equal(renderer.root.findAllByType(StageReasonField).length, 0);

    await act(async () =>
      renderer.update(renderCard({ stageId: WAITING_FOR_RESPONSE_STAGE_ID, stageNote: "" })),
    );
    assert.equal(renderer.root.findByType(StageReasonField).props.isErrorRevealed, false);

    await act(async () =>
      renderer.update(renderCard({ stageId: WAITING_FOR_RESPONSE_STAGE_ID, stageNote: "" }, true)),
    );
    assert.equal(renderer.root.findByType(StageReasonField).props.isErrorRevealed, true);
    assert.ok(JSON.stringify(renderer.toJSON()).includes(STAGE_REASON_COPY.REQUIRED_ERROR));

    await act(async () =>
      renderer.update(renderCard({ stageId: "done-stage", stageNote: REASON })),
    );
    assert.equal(renderer.root.findAllByType(StageReasonField).length, 0);
  } finally {
    await act(async () => renderer.unmount());
  }
});

test("bulk waiting moves send one reason per apartment and clear selection only on success", async () => {
  setSession({
    accessToken: "test-token",
    user: { ...constraintUser, permissions: [PERMISSIONS.PROJECTS_STATUS_CHANGE] },
  });
  const errorLog = mock.method(logger, "error", () => {});
  const responses = [waitingReasonError(), null, null];
  const patch = mock.method(httpClient, "patch", async () => {
    const failure = responses.shift();

    if (failure) {
      throw failure;
    }

    return { data: project };
  });
  const clears = mock.fn();
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const renderer = await render(
    <QueryClientProvider client={client}>
      <ApartmentSelectionBar stages={stages} onClear={clears} apartmentIds={["apt-1", "apt-2"]} />
    </QueryClientProvider>,
  );

  try {
    await act(async () => renderer.root.findByType(Autocomplete).props.onChange("מחכה לתשובה"));
    assert.equal(
      renderer.root.findByType(StageReasonPopup).props.title,
      "העברת 2 דירות לשלב ״מחכה לתשובה״",
    );
    await typeReason(renderer, REASON);

    await act(async () => getPrimary(renderer).onClick());
    assert.equal(clears.mock.callCount(), 0);
    assert.equal(renderer.root.findByType(StageReasonPopup).props.open, true);
    assert.equal(renderer.root.findAllByType(InlineError).length, 1);

    await act(async () => {
      await getPrimary(renderer).onClick();
      await settle();
    });
    assert.equal(clears.mock.callCount(), 1);
    assert.deepEqual(
      patch.mock.calls.slice(-2).map(call => call.arguments),
      ["apt-1", "apt-2"].map(id => [
        API_ENDPOINTS.projectStage(id),
        { stageId: WAITING_FOR_RESPONSE_STAGE_ID, note: REASON },
      ]),
    );
  } finally {
    errorLog.mock.restore();
    patch.mock.restore();
    await act(async () => renderer.unmount());
  }
});
