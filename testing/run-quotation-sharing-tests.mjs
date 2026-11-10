import {
  tabsRendererTestPlugin,
  componentStyleTestPlugin,
} from "./quotation-render.test-plugin.mjs";

import { runBundledTest } from "./test-runner.utility.mjs";

await runBundledTest({
  input: "testing/quotation-sharing.test.tsx",
  output: "quotation-sharing.test.mjs",
  external: ["@tanstack/react-query", "react-router-dom", "axios", "moment"],
  plugins: [tabsRendererTestPlugin, componentStyleTestPlugin],
});
