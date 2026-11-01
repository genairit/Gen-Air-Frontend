import { resolve } from "node:path";
import { TEST_ROOT, runNodeTest, runBundledTest } from "./test-runner.utility.mjs";

for (const name of ["utility", "action"]) {
  runNodeTest(resolve(TEST_ROOT, `testing/apartment-import.${name}.test.ts`), [
    "--experimental-strip-types",
  ]);
}

for (const name of ["components", "interactions", "integration"]) {
  await runBundledTest({
    input: `testing/apartment-import.${name}.test.tsx`,
    output: `import-${name}.test.mjs`,
  });
}
