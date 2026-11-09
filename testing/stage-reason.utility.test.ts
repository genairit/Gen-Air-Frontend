import {
  isolateText,
  requiresStageNote,
  toStageMovePayload,
  validateStageReason,
  countStageNoteErrors,
  toWaitingReasonLines,
  toStageReasonValidator,
  isWaitingForResponseStage,
} from "../src/utilities/stage-reason.utility";

import {
  STAGE_REASON_COPY,
  WAITING_FOR_RESPONSE_STAGE_ID,
} from "../src/constants/project-stage.constant";

import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { project } from "./project-tasks.fixture";
import { API_ENDPOINTS } from "../src/constants/api.constant";
import { USER_ROLES } from "../src/constants/user-role.constant";
import { httpClient } from "../src/services/http-client.service";
import { projectService } from "../src/services/project.service";
import { PERMISSIONS } from "../src/constants/permission.constant";
import { toTimelineEntry } from "../src/utilities/mappers/project.mapper";
import type { IApiStageTransition } from "../src/interfaces/api.interface";
import { isApiProject, isApiStageTransition } from "../src/utilities/guards/api.guard";
import { toAuthorizedProjectUpdate } from "../src/utilities/project-permission.utility";
import { toProjectFormValues, toProjectPayload } from "../src/utilities/project.utility";

const WAITING = WAITING_FOR_RESPONSE_STAGE_ID;
const REASON = "ממתינים לאישור התוכנית מהאדריכל";

const createTransition = (changes: Partial<IApiStageTransition> = {}): IApiStageTransition => ({
  id: "transition-1",
  toStageId: WAITING,
  createdAt: "2026-11-09T08:30:00.000Z",
  changedByRole: USER_ROLES.PROJECT_MANAGER,
  note: REASON,
  ...changes,
});

const changedBy = {
  id: "user-1",
  firstName: "רינה",
  lastName: "כהן",
  employeeNumber: "104",
  email: "rina@example.invalid",
  phone: "0500000000",
  deletedAt: null,
  role: USER_ROLES.PROJECT_MANAGER,
  assignedRoles: [USER_ROLES.PROJECT_MANAGER],
};

test("the waiting stage is detected by its id and only entering it requires a note", () => {
  assert.equal(isWaitingForResponseStage(WAITING), true);
  assert.equal(isWaitingForResponseStage("other-stage"), false);
  assert.equal(isWaitingForResponseStage(null), false);
  assert.equal(requiresStageNote({ stageId: WAITING, originalStageId: "draft" }), true);
  assert.equal(requiresStageNote({ stageId: WAITING, originalStageId: null }), true);
  assert.equal(requiresStageNote({ stageId: WAITING, originalStageId: WAITING }), false);
  assert.equal(requiresStageNote({ stageId: "draft", originalStageId: WAITING }), false);
});

test("a reason must contain non-blank text and errors stay hidden until revealed", () => {
  assert.deepEqual(validateStageReason(" \n\t "), {
    isValid: false,
    errorText: STAGE_REASON_COPY.REQUIRED_ERROR,
  });
  assert.equal(validateStageReason("Architect אישור 3").isValid, true);
  assert.equal(validateStageReason("א".repeat(255)).isValid, true);
  assert.equal(toStageReasonValidator(false)("").isValid, true);
  assert.equal(toStageReasonValidator(true)("").errorText, STAGE_REASON_COPY.REQUIRED_ERROR);
});

test("stage move payloads send a trimmed note only when one exists", () => {
  assert.deepEqual(toStageMovePayload({ stageId: WAITING, note: `  ${REASON}\n` }), {
    stageId: WAITING,
    note: REASON,
  });
  assert.deepEqual(toStageMovePayload({ stageId: "draft" }), { stageId: "draft" });
  assert.deepEqual(toStageMovePayload({ stageId: "draft", note: null }), { stageId: "draft" });
  assert.deepEqual(toStageMovePayload({ stageId: "draft", note: "   " }), { stageId: "draft" });
});

test("the project service patches the stage endpoint with the move payload", async () => {
  const patch = mock.method(httpClient, "patch", async () => ({ data: project }));

  try {
    await projectService.moveToStage(project.id, { stageId: WAITING, note: ` ${REASON} ` });
    await projectService.moveToStage(project.id, { stageId: "draft" });

    assert.deepEqual(
      patch.mock.calls.map(call => call.arguments),
      [
        [API_ENDPOINTS.projectStage(project.id), { stageId: WAITING, note: REASON }],
        [API_ENDPOINTS.projectStage(project.id), { stageId: "draft" }],
      ],
    );
  } finally {
    patch.mock.restore();
  }
});

test("the edit payload carries stageNote only when the stage changes into waiting", () => {
  const original = toProjectFormValues(project);
  const submit = (changes: Partial<typeof original>, originalStageId: string | null) =>
    toProjectPayload({
      fieldSet: null,
      originalStageId,
      originalIntake: null,
      values: { ...original, ...changes },
    });

  assert.equal(original.stageNote, "");
  assert.equal(toProjectFormValues(null).stageNote, "");
  assert.equal(submit({ stageId: WAITING, stageNote: ` ${REASON} ` }, "draft")?.stageNote, REASON);
  assert.equal(
    Object.hasOwn(submit({ stageId: WAITING, stageNote: REASON }, WAITING) ?? {}, "stageNote"),
    false,
  );
  assert.equal(
    Object.hasOwn(submit({ stageId: "other", stageNote: REASON }, "draft") ?? {}, "stageNote"),
    false,
  );
  assert.equal(
    Object.hasOwn(submit({ stageId: WAITING, stageNote: "  " }, "draft") ?? {}, "stageNote"),
    false,
  );
  assert.equal(
    Object.hasOwn(
      toProjectPayload({
        fieldSet: null,
        originalIntake: null,
        values: { ...original, stageNote: REASON },
      }) ?? {},
      "stageNote",
    ),
    false,
  );
});

test("users without status permission send neither stageId nor stageNote", () => {
  const payload = toProjectPayload({
    fieldSet: null,
    originalIntake: null,
    originalStageId: "draft",
    values: { ...toProjectFormValues(project), stageId: WAITING, stageNote: REASON },
  });
  assert.ok(payload);

  const editor = { ...changedBy, permissions: [PERMISSIONS.PROJECTS_UPDATE] };
  const statusEditor = { ...editor, permissions: [PERMISSIONS.PROJECTS_STATUS_CHANGE] };
  const restricted = toAuthorizedProjectUpdate(payload, editor);

  assert.equal(Object.hasOwn(restricted, "stageId"), false);
  assert.equal(Object.hasOwn(restricted, "stageNote"), false);
  assert.equal(toAuthorizedProjectUpdate(payload, statusEditor).stageNote, REASON);
});

test("the edit form counts a missing reason only when entering waiting", () => {
  const change = { stageId: WAITING, originalStageId: "draft" };

  assert.equal(countStageNoteErrors({ ...change, stageNote: " " }), 1);
  assert.equal(countStageNoteErrors({ ...change, stageNote: REASON }), 0);
  assert.equal(countStageNoteErrors({ ...change, stageId: "draft", stageNote: "" }), 0);
  assert.equal(countStageNoteErrors({ ...change, originalStageId: WAITING, stageNote: "" }), 0);
});

test("banner lines isolate the reason and add meta only from the matching transition", () => {
  const withName = createTransition({ changedBy });

  assert.deepEqual(toWaitingReasonLines({ waitingReason: null, latestTransition: null }), [
    STAGE_REASON_COPY.BANNER_EMPTY,
  ]);
  assert.deepEqual(toWaitingReasonLines({ waitingReason: "  ", latestTransition: withName }), [
    STAGE_REASON_COPY.BANNER_EMPTY,
  ]);
  assert.deepEqual(toWaitingReasonLines({ waitingReason: REASON, latestTransition: null }), [
    isolateText(REASON),
  ]);
  assert.deepEqual(
    toWaitingReasonLines({
      waitingReason: REASON,
      latestTransition: createTransition({ note: "סיבה אחרת" }),
    }),
    [isolateText(REASON)],
  );

  const [reasonLine, metaLine] = toWaitingReasonLines({
    waitingReason: REASON,
    latestTransition: withName,
  });

  assert.equal(reasonLine, `⁨${REASON}⁩`);
  assert.match(metaLine, /^עודכן ⁨\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}⁩ · ⁨רינה כהן⁩$/);
  assert.match(
    toWaitingReasonLines({ waitingReason: REASON, latestTransition: createTransition() })[1],
    /· ⁨מנהל/,
  );
});

test("timeline entries carry trimmed notes and label archived stages", () => {
  const entry = toTimelineEntry(createTransition({ note: `  ${REASON}  ` }), 0);

  assert.equal(entry.note, REASON);
  assert.equal(entry.label, STAGE_REASON_COPY.ARCHIVED_STAGE);
  assert.equal(toTimelineEntry(createTransition({ note: "  " }), 1).note, null);
  assert.equal(toTimelineEntry(createTransition({ note: null }), 1).note, null);

  const stage = { id: WAITING, name: "מחכה לתשובה", position: 1, tag: null, color: null };
  const named = toTimelineEntry(createTransition({ toStage: { ...stage, description: null } }), 0);
  assert.equal(named.label, "מחכה לתשובה");
});

test("api guards accept nullable notes and waiting reasons and reject other types", () => {
  const transition = createTransition();
  const withoutNote = { ...transition };
  Reflect.deleteProperty(withoutNote, "note");

  assert.equal(isApiStageTransition(transition), true);
  assert.equal(isApiStageTransition({ ...transition, note: null }), true);
  assert.equal(isApiStageTransition(withoutNote), true);
  assert.equal(isApiStageTransition({ ...transition, note: 7 }), false);

  assert.equal(isApiProject(project), true);
  assert.equal(isApiProject({ ...project, waitingReason: REASON }), true);
  assert.equal(isApiProject({ ...project, waitingReason: null }), true);
  assert.equal(isApiProject({ ...project, waitingReason: 7 }), false);
});
