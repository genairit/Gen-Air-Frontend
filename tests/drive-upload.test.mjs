import ts from "typescript";
import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith(".") && context.parentURL) {
      for (const suffix of [".ts", "/index.ts"]) {
        const url = new URL(specifier + suffix, context.parentURL);
        if (existsSync(url)) return { url: url.href, shortCircuit: true };
      }
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith(".ts"))
      return {
        format: "module",
        shortCircuit: true,
        source: ts.transpileModule(
          readFileSync(fileURLToPath(url), "utf8").replaceAll("import.meta.env", "({})"),
          {
            compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
          },
        ).outputText,
      };
    return next(url, context);
  },
});

const { validateProjectFiles, UploadValidationError, getUploadAccept } =
  await import("../src/utilities/drive-upload.utility.ts");
const { projectActivityService } = await import("../src/services/project-activity.service.ts");
const { httpClient } = await import("../src/services/http-client.service.ts");
const { getApiErrorMessage } = await import("../src/utilities/api-error.utility.ts");
const policy = {
  maxFiles: 2,
  maxFileSizeBytes: 250000,
  maxArchiveSizeBytes: 50000,
  maxTextSizeBytes: 10000,
  blockedNamePattern: String.raw`[\\/:]|(?:^|\.)(?:exe|sh|js)(?:\.|$)`,
  types: {
    pdf: { kind: "binary", mimeType: "application/pdf", signatures: [[37, 80, 68, 70, 45]] },
    txt: { kind: "text", mimeType: "text/plain", signatures: [] },
    dxf: { kind: "dxf", mimeType: "image/vnd.dxf", signatures: [] },
    zip: { kind: "zip", mimeType: "application/zip", signatures: [[80, 75, 3, 4]] },
  },
};
const pdf = new File(["%PDF-1.7\nexample\n%%EOF"], "תוכנית.PDF", { type: "" });
test("accepts document signatures with an empty or inaccurate browser MIME", async () => {
  await validateProjectFiles([pdf], policy);
  await validateProjectFiles([new File(["תוכנית"], "notes.txt")], policy);
  await validateProjectFiles([new File(["0\nSECTION\n2\nHEADER"], "plan.dxf")], policy);
  await validateProjectFiles([new File([new Uint8Array([80, 75, 3, 4, 0])], "plans.zip")], policy);
  assert.match(getUploadAccept(policy), /\.zip/);
});
test("rejects executables, disguised bytes, empty files, unsafe names and oversized batches", async () => {
  for (const file of [
    new File(["MZ"], "app.exe"),
    new File(["MZ"], "plan.pdf"),
    new File([""], "plan.pdf"),
    new File(["%PDF-1.7"], "app.exe.pdf"),
    new File(["%PDF-1.7"], "../plan.pdf"),
    new File([new Uint8Array([77, 90, 0, 255])], "notes.txt"),
  ]) {
    await assert.rejects(validateProjectFiles([file], policy), UploadValidationError);
  }
  await assert.rejects(validateProjectFiles([], policy), UploadValidationError);
  await assert.rejects(validateProjectFiles([pdf, pdf, pdf], policy), UploadValidationError);
  await assert.rejects(
    validateProjectFiles([pdf], { ...policy, maxFileSizeBytes: 1 }),
    UploadValidationError,
  );
});
test("blocks multipart POSTs on client failure and surfaces a useful local message", async () => {
  const originalGet = httpClient.get;
  const originalPost = httpClient.post;
  const posts = [];
  httpClient.get = async () => ({ data: policy });
  httpClient.post = async (...args) => {
    posts.push(args);
    return { data: [] };
  };
  try {
    await assert.rejects(
      projectActivityService.uploadFiles("project", [new File(["MZ"], "renamed.pdf")]),
      error => {
        assert.match(getApiErrorMessage(error), /renamed.pdf/);
        return error instanceof UploadValidationError;
      },
    );
    assert.equal(posts.length, 0);
    await projectActivityService.uploadFiles("project", [pdf]);
    assert.equal(posts.length, 1);
    assert.equal(posts[0][1].getAll("files").length, 1);
  } finally {
    httpClient.get = originalGet;
    httpClient.post = originalPost;
  }
});
test("fails closed when upload policy is unavailable or malformed", async () => {
  const originalGet = httpClient.get;
  const originalPost = httpClient.post;
  const posts = [];
  httpClient.post = async (...args) => posts.push(args);
  try {
    httpClient.get = async () => ({ data: {} });
    await assert.rejects(projectActivityService.uploadFiles("project", [pdf]));
    httpClient.get = async () => {
      throw new Error("offline");
    };
    await assert.rejects(projectActivityService.uploadFiles("project", [pdf]));
    assert.equal(posts.length, 0);
  } finally {
    httpClient.get = originalGet;
    httpClient.post = originalPost;
  }
});
