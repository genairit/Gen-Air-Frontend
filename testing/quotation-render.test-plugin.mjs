export const tabsRendererTestPlugin = {
  name: "tabs-renderer-stub",
  resolveId: id => (id.endsWith("/components/Tabs/Tabs") ? "\0tabs-renderer-stub" : null),
  load: id =>
    id === "\0tabs-renderer-stub"
      ? {
          code: `import React from "react";
          const Tabs = ({items, activeId, onChange, ariaLabel}) =>
            React.createElement("div", {role: "tablist", "aria-label": ariaLabel},
              items.map(item => React.createElement("button", {
                key: item.id, role: "tab", "aria-selected": item.id === activeId,
                onClick: () => onChange(item.id)
              }, item.label)));
          export default Tabs;`,
          moduleType: "js",
        }
      : null,
};

export const componentStyleTestPlugin = {
  name: "component-style-stub",
  resolveId: id => (id.endsWith(".css") ? `\0style:${id}` : null),
  load: id => (id.startsWith("\0style:") ? { code: "export default {};", moduleType: "js" } : null),
};
