import {
  tabsRendererTestPlugin,
  componentStyleTestPlugin,
  confirmationPopupRendererTestPlugin,
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

for (const suite of ["components", "cancellation"]) {
  const plugins =
    suite === "cancellation"
      ? [confirmationPopupRendererTestPlugin, tabsRendererTestPlugin, componentStyleTestPlugin]
      : [tabsRendererTestPlugin, componentStyleTestPlugin];
  await runBundledTest({
    input: `testing/quotation.${suite}.test.tsx`,
    output: `quotation.${suite}.test.mjs`,
    external: ["@tanstack/react-query", "react-router-dom", "axios", "moment"],
    plugins,
  });
}
