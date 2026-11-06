---
applyTo: "src/**/*.tsx"
description: "Prefer Gen-Air generic components over direct MUI controls when implementing client UI."
---

# Generic components first

- Search `src/components/` before adding a UI control. Reuse the generic Button, Tabs,
  CheckBox, RadioButton, TextField, Autocomplete, GenericPopup, Card, InlineError, and other
  suitable shared components rather than equivalent MUI controls in feature code.
- Extend a suitable generic component when a small, reusable capability is missing.
  Preserve its existing callers, design language, native semantics, keyboard behavior,
  focus, RTL support, and loading/error states.
- MUI may remain inside generic component implementations, for layout/style primitives,
  and for accessible infrastructure without a suitable shared equivalent. Do not create
  pass-through wrappers merely to remove MUI imports.
