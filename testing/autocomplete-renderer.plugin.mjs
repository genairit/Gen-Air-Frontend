export const autocompleteRendererPlugin = {
  name: "test-autocomplete-renderer",
  resolveId: id =>
    id.includes("/components/Autocomplete/Autocomplete") ? "\0test-autocomplete-renderer" : null,
  load: id =>
    id === "\0test-autocomplete-renderer"
      ? {
          code: `import React from "react";
          const Autocomplete = ({title, options = [], value = null, disabled = false, onChange}) =>
            React.createElement("label", null,
              React.createElement("span", null, title),
              React.createElement("select", {
                "aria-label": title,
                value: value ?? "",
                disabled,
                onChange: event => onChange?.(event.target.value || null)
              },
                React.createElement("option", {value: ""}, ""),
                options.map(option => React.createElement("option", {
                  key: option, value: option
                }, option))
              )
            );
          export default Autocomplete;`,
          moduleType: "js",
        }
      : null,
};
