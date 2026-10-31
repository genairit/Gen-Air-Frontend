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
  plugins: [
    {
      name: "component-style-stub",
      resolveId: id => (id.endsWith(".css") ? `\0style:${id}` : null),
      load: id =>
        id.startsWith("\0style:") ? { code: "export default {};", moduleType: "js" } : null,
    },
  ],
});
