import {
  tabsRendererTestPlugin,
  componentStyleTestPlugin,
} from "./quotation-render.test-plugin.mjs";

import { runBundledTest } from "./test-runner.utility.mjs";

await runBundledTest({
  input: "testing/quotation.utility.test.ts",
  output: "quotation.utility.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom"],
});
await runBundledTest({
  input: "testing/quotation.interactions.test.tsx",
  output: "quotation.interactions.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom"],
});

await runBundledTest({
  input: "testing/quotation.components.test.tsx",
  output: "quotation.components.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom", "axios", "moment"],
  plugins: [tabsRendererTestPlugin, componentStyleTestPlugin],
});
