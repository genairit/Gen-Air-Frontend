import { runBundledTest } from "./test-runner.utility.mjs";
import { componentStyleTestPlugin } from "./quotation-render.test-plugin.mjs";

await runBundledTest({
  input: "testing/autocomplete-options.test.ts",
  output: "autocomplete-options.test.mjs",
});

await runBundledTest({
  input: "testing/quotation-shared-fields.test.tsx",
  output: "quotation-shared-fields.test.mjs",
  plugins: [componentStyleTestPlugin],
});
