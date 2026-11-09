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
      name: "tabs-renderer-stub",
      resolveId: id => (id.endsWith("/components/Tabs/Tabs") ? "\0tabs-renderer-stub" : null),
      load: id =>
        id === "\0tabs-renderer-stub"
          ? {
              code: `import React from "react";
          export default function Tabs({items, activeId, onChange, ariaLabel}) {
            return React.createElement("div", {role: "tablist", "aria-label": ariaLabel},
              items.map(item => React.createElement("button", {
                key: item.id, role: "tab", "aria-selected": item.id === activeId,
                onClick: () => onChange(item.id)
              }, item.label)));
          }`,
              moduleType: "js",
            }
          : null,
    },
    {
      name: "component-style-stub",
      resolveId: id => (id.endsWith(".css") ? `\0style:${id}` : null),
      load: id =>
        id.startsWith("\0style:") ? { code: "export default {};", moduleType: "js" } : null,
    },
  ],
});
