import { test } from "node:test";
import assert from "node:assert/strict";
import { API_ENDPOINTS } from "../src/constants/api.constant";
import { httpClient } from "../src/services/http-client.service";
import { quotationService } from "../src/services/quotation.service";

const withSalesAgentResponse = async (data: unknown) => {
  const originalAdapter = httpClient.defaults.adapter;
  httpClient.defaults.adapter = async config => ({
    config,
    status: 200,
    statusText: "OK",
    headers: {},
    data,
  });

  try {
    return await quotationService.salesAgents();
  } finally {
    httpClient.defaults.adapter = originalAdapter;
  }
};

const withPdfResponse = async (disposition: string | null) => {
  const originalAdapter = httpClient.defaults.adapter;
  httpClient.defaults.adapter = async config => ({
    config,
    status: 200,
    statusText: "OK",
    headers: disposition ? { "content-disposition": disposition } : {},
    data: new Blob(["%PDF-1.7"], { type: "application/pdf" }),
  });

  try {
    return await quotationService.exportPdf("quotation-1");
  } finally {
    httpClient.defaults.adapter = originalAdapter;
  }
};

test("PDF service uses the UTF-8 filename supplied by the export response", async () => {
  const filename = "הצעת מחיר Q-1_לקוח_P-2_4_אלקטרה.pdf";
  const result = await withPdfResponse(
    `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
  );

  assert.equal(result.filename, filename);
  assert.equal(result.pdf.type, "application/pdf");
});

test("PDF service rejects missing and malformed filename headers", async () => {
  await assert.rejects(withPdfResponse(null), /שם קובץ הצעת המחיר חסר/);
  await assert.rejects(
    withPdfResponse("attachment; filename=quotation.pdf"),
    /שם קובץ הצעת המחיר חסר/,
  );
  await assert.rejects(withPdfResponse("attachment; filename*=UTF-8''%ZZ"), URIError);
});

test("sales-agent service returns validated eligible sales agents", async () => {
  const agents = [
    {
      id: "agent-1",
      firstName: "Noa",
      lastName: "Cohen",
      employeeNumber: "1042",
    },
  ];

  assert.deepEqual(await withSalesAgentResponse(agents), agents);
});

test("sales-agent service rejects malformed sales-agent rows", async () => {
  await assert.rejects(
    withSalesAgentResponse([{ id: "agent-1", firstName: "Noa", lastName: "Cohen" }]),
    /רשימת סוכני המכירות אינה תקינה/,
  );
});

test("sales-agent service rejects non-array successful responses", async () => {
  await assert.rejects(
    withSalesAgentResponse({
      items: [{ id: "agent-1", firstName: "Noa", lastName: "Cohen", employeeNumber: "1042" }],
    }),
    /רשימת סוכני המכירות אינה תקינה/,
  );
});

test("sales-agent service requests the quotation sales-agent endpoint", async () => {
  const originalAdapter = httpClient.defaults.adapter;
  const captured = { requestedEndpoint: "" };
  httpClient.defaults.adapter = async config => {
    captured.requestedEndpoint = config.url ?? "";
    return {
      config,
      status: 200,
      statusText: "OK",
      headers: {},
      data: [],
    };
  };

  try {
    await quotationService.salesAgents();
    assert.equal(captured.requestedEndpoint, API_ENDPOINTS.QUOTATION_SALES_AGENTS);
  } finally {
    httpClient.defaults.adapter = originalAdapter;
  }
});
