export const autocompleteRendererPlugin = {
  name: "test-autocomplete-renderer",
  resolveId: id =>
    id.includes("/components/Autocomplete/Autocomplete") ? "\0test-autocomplete-renderer" : null,
  load: id =>
    id === "\0test-autocomplete-renderer"
      ? {
          code: `import React from "react";
          const Autocomplete = ({title, options = [], items, value = null, disabled = false, onChange}) =>
            React.createElement("label", null,
              React.createElement("span", null, title),
              React.createElement("select", {
                "aria-label": title,
                value: value ?? "",
                disabled,
                onChange: event => onChange?.(event.target.value || null)
              },
                React.createElement("option", {value: ""}, ""),
                (items ?? options.map(option => ({value: option, label: option}))).map(option => React.createElement("option", {
                  key: option.value, value: option.value
                }, option.label))
              )
            );
          export default Autocomplete;`,
          moduleType: "js",
        }
      : null,
};
