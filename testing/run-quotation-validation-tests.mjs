import { runBundledTest } from "./test-runner.utility.mjs";
import { componentStyleTestPlugin } from "./quotation-render.test-plugin.mjs";

await runBundledTest({
  input: "testing/quotation.validation.test.tsx",
  output: "quotation.validation.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom", "axios", "moment"],
  plugins: [componentStyleTestPlugin],
});
