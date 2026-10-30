import { build } from "rolldown";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";

export const TEST_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const EXTERNAL_PACKAGES = [
  "react",
  "react-dom/server",
  "react-test-renderer",
  "@mui/material",
  "@mui/icons-material",
  "lottie-react",
];

export const runNodeTest = (path, options = []) => {
  const result = spawnSync(process.execPath, [...options, "--test", path], {
    cwd: TEST_ROOT,
    stdio: "inherit",
  });
  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

export const runBundledTest = async ({ input, output, external = [] }) => {
  const file = resolve(TEST_ROOT, "node_modules/.tmp", output);
  await build({
    input: resolve(TEST_ROOT, input),
    platform: "node",
    moduleTypes: { ".png": "dataurl" },
    external: [...EXTERNAL_PACKAGES, ...external],
    transform: { define: { "import.meta.env": "{}" } },
    output: { file, format: "esm", codeSplitting: false },
  });
  runNodeTest(file);
};
