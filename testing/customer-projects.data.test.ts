import {
  STAGE_ID,
  CUSTOMER_ID,
  createRelatedPage,
  OTHER_CUSTOMER_ID,
} from "./customer-projects.fixture";

import {
  createProjectAction,
  deleteProjectAction,
  updateProjectAction,
  refreshProjectQueriesAction,
} from "../src/actions/project.action";

import {
  createApartmentAction,
  updateApartmentAction,
  moveApartmentsToStageAction,
} from "../src/actions/apartment.action";

import { test } from "node:test";
import assert from "node:assert/strict";
import { project } from "./project-tasks.fixture";
import { queryClient } from "../src/providers/query-client";
import { API_ENDPOINTS } from "../src/constants/api.constant";
import { QUERY_KEYS } from "../src/constants/query-key.constant";
import { httpClient } from "../src/services/http-client.service";
import { toProjectFormValues } from "../src/utilities/project.utility";
import type { IProjectSubmission } from "../src/interfaces/project.interface";
import { customerProjectService } from "../src/services/customer-project.service";
import { refreshImportedApartmentsAction } from "../src/actions/apartment-import-flow.action";
import { PROJECT_DETAIL_FIELD_SETS } from "../src/constants/project-detail-field-set.constant";

test("customer-scoped service sends trimmed search/status and initial8 versus continuation10 parameters", async () => {
  const requests: { url: string; params: unknown }[] = [];
  const original = httpClient.defaults.adapter;
  httpClient.defaults.adapter = async config => {
    requests.push({ url: config.url ?? "", params: config.params });
    return { config, status: 200, statusText: "OK", headers: {}, data: createRelatedPage() };
  };
  try {
    await customerProjectService.getPage(
      CUSTOMER_ID,
      { search: "  פרויקט  ", stageId: STAGE_ID },
      null,
    );
    await customerProjectService.getPage(
      CUSTOMER_ID,
      { search: "  ", stageId: null },
      "cursor-page-2",
    );
    assert.deepEqual(requests, [
      {
        url: API_ENDPOINTS.customerProjects(CUSTOMER_ID),
        params: { search: "פרויקט", stageId: STAGE_ID, batchCursor: null, batchSize: 8 },
      },
      {
        url: API_ENDPOINTS.customerProjects(CUSTOMER_ID),
        params: { search: null, stageId: null, batchCursor: "cursor-page-2", batchSize: 10 },
      },
    ]);
  } finally {
    httpClient.defaults.adapter = original;
  }
});

test("customer project service rejects malformed successful responses rather than caching unvalidated rows", async () => {
  const original = httpClient.defaults.adapter;
  httpClient.defaults.adapter = async config => ({
    config,
    status: 200,
    statusText: "OK",
    headers: {},
    data: { items: [{ id: "unvalidated" }], nextCursor: null, total: 1 },
  });
  try {
    await assert.rejects(
      customerProjectService.getPage(CUSTOMER_ID, { search: "", stageId: null }, null),
    );
  } finally {
    httpClient.defaults.adapter = original;
  }
});

const submission: IProjectSubmission = {
  values: toProjectFormValues(project),
  fieldSet: PROJECT_DETAIL_FIELD_SETS.COMPANY,
  originalIntake: null,
};

const scenarios = [
  { name: "project creation", perform: () => createProjectAction(submission) },
  {
    name: "project customer or member edit",
    perform: () => updateProjectAction({ ...submission, projectId: project.id }),
  },
  { name: "project deletion", perform: () => deleteProjectAction(project.id) },
  { name: "project status mutation settlement", perform: () => refreshProjectQueriesAction() },
  {
    name: "apartment creation",
    perform: () =>
      createApartmentAction({
        buildingId: "building-1",
        values: {
          floor: "0",
          apartmentNumber: "1",
          customerId: CUSTOMER_ID,
          members: null,
          paymentTerms: null,
          paymentTermsNote: "",
        },
      }),
  },
  {
    name: "apartment edit",
    perform: () => updateApartmentAction({ apartmentId: project.id, changes: { notes: "מעודכן" } }),
  },
  {
    name: "apartment status edit",
    perform: () => moveApartmentsToStageAction({ apartmentIds: [project.id], stageId: STAGE_ID }),
  },
  {
    name: "apartment Excel import refresh",
    perform: () => refreshImportedApartmentsAction("building-1"),
  },
];

for (const scenario of scenarios) {
  test(`${scenario.name} invalidates customer-project pages for both old and new customers and every filter`, async () => {
    const keys = [
      QUERY_KEYS.customerProjects(CUSTOMER_ID, { search: "", stageId: null }),
      QUERY_KEYS.customerProjects(OTHER_CUSTOMER_ID, { search: "חדש", stageId: STAGE_ID }),
    ];
    const original = httpClient.defaults.adapter;
    httpClient.defaults.adapter = async config => ({
      config,
      status: 200,
      statusText: "OK",
      headers: {},
      data: project,
    });
    for (const key of keys) {
      queryClient.setQueryData(key, { pages: [createRelatedPage()], pageParams: [null] });
    }
    try {
      await scenario.perform();
      for (const key of keys) {
        assert.equal(queryClient.getQueryState(key)?.isInvalidated, true);
      }
    } finally {
      httpClient.defaults.adapter = original;
      queryClient.clear();
    }
  });
}
