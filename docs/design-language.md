# GenAir — Design Language

> A practical visual specification for designing and extending the GenAir CRM.
>
> Updated: 2 November 2026. Based on the current frontend implementation, shared design tokens, components, and approved quotation-footer correction released in frontend commit `25aa86c5d1f31209868fa46606f7e9173f6852af`.
>
> **Scope:** visual language, composition, typography, interaction states, responsive behavior, and implementation guidance. Documented token values are observed implementation values. The minimalism principles below are explicitly approved product-design requirements for future work and refinements; they are not a claim that every current screen already satisfies them. Other recommendations are identified where applicable.

## 1. The visual identity

**GenAir is a Hebrew-first, RTL business application with a light neumorphic / Soft UI design language.**

The interface feels calm, rounded, tactile, and spacious. Almost-white surfaces sit on an almost-white canvas. Depth comes from paired shadows rather than strong borders or large changes in surface color. Blue communicates the main action and selected states; charcoal anchors text and high-emphasis controls.

### How to classify the style

| Style                     | Relationship to GenAir                                                                                                                                                      |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Neumorphism / Soft UI** | The primary language: matching canvas and surface colors, soft raised surfaces, recessed fields, and paired highlight/shadow edges.                                         |
| **Claymorphism**          | Some clay-like softness is present in rounded, pill-shaped controls. Thick, inflated, toy-like 3D objects are not the defining pattern.                                     |
| **Glassmorphism**         | Not the core language. Main cards are opaque, without frosted-glass transparency or backdrop blur.                                                                          |
| **Flat / Material UI**    | React/MUI supplies implementation primitives, but the visible treatment is customized into GenAir's soft surface system. Default Material styling is not the visual target. |

### The visual formula

**Pale canvas + opaque rounded surfaces + consistent paired shadows + recessed fields + restrained blue accents + strong Hebrew typography.**

Avoid turning the app into a dark dashboard, a transparent glass interface, a colorful gradient product, or a heavily bordered spreadsheet.

## 2. Minimalism and minimum-effort workflows

**GenAir contains many features. Each screen should expose the smallest clear set of information and actions needed for the employee's current task.**

Minimalism applies to both appearance and interaction: reduce clutter, confusion, clicks, scrolling, repeated input, and unnecessary navigation. A visually clean screen that makes a common action harder to find does not meet this requirement.

### A. Give each screen a clear purpose

- Organize a page around the user's goal, with one visually dominant next action where appropriate.
- Show the information needed to make the next decision; give secondary details lower emphasis.
- Use the user's role, permissions, and current record context to keep unrelated features out of the working area.
- Keep related tasks together. Avoid forcing users to visit multiple pages to complete one simple operation.
- Prefer clear, familiar labels and consistent action positions over explanations the user must repeatedly read.

### B. Minimize clicks and repeated effort

- Keep frequent actions visible and directly usable. Search fields should accept typing immediately; do not require a disclosure click before typing.
- Offer contextual actions beside the relevant record, file, field, or row when that shortens the workflow.
- Open creation/editing flows with known context already selected, such as the current project or customer, when the relationship is unambiguous and editable as appropriate.
- Use sensible defaults and reuse known data. Do not ask the employee to enter information the system already has.
- Support keyboard operation, Enter to submit where appropriate, and predictable focus order. Shortcuts should supplement visible controls.
- For repetitive work, consider multi-select and batch operations when their scope and consequences can be made clear.
- Use autosave only where the workflow supports it, with visible saving/saved/error feedback and reliable recovery. Do not add an extra save step without a reason.
- Remove intermediate screens, redundant confirmations, and repeated selections that add no decision or protection.

Minimize **unnecessary** steps. Keep confirmation or another appropriate safeguard for destructive, irreversible, financial, or otherwise consequential actions. Do not trade clarity, authorization, validation, or accessibility for a smaller click count.

### C. Minimize scrolling without crowding the page

- Place the main working content and frequent actions early in the page, following the approved screen layout.
- Use compact headers and appropriately sized controls. Avoid oversized identity cards, empty padding, decorative banners, and explanatory text that pushes work below the fold.
- Use desktop columns for genuinely related content that benefits from comparison; stack them appropriately on mobile.
- Avoid making users scroll to the bottom just to perform a frequent action. A contextual or sticky action area can help when it does not obscure content or duplicate controls unnecessarily.
- For genuinely long workflows, use clear section navigation or meaningful tabs that preserve entered data and context.
- Keep search/filter state, selected records, and return position when moving into a detail view and back where practical.

Do not hide essential fields in collapsed panels simply to shorten the page. Reducing visible height by adding discovery work and extra clicks can increase overall effort.

### D. Use fewer cards, containers, and visual layers

- Create a card only when it represents a meaningful information group or interaction boundary.
- Prefer one coherent section over several small cards for closely related fields.
- Within a card, use alignment, typography, modest spacing, or a subtle separator before adding another raised card.
- Avoid card-inside-card-inside-card composition. Each shadow, outline, and container should have a purpose.
- Do not give every label, value, status, or action its own elevated tile.
- Avoid repeated section headings, duplicated metadata, and large empty cards that contribute no useful next action.
- Use compact rows or a table for repetitive records rather than a large card per item when comparison and scanning are the main tasks.

The goal is fewer **perceived containers and competing groups**, not an arbitrary ban on HTML `div` elements. Choose semantic markup and layout wrappers for correctness; optimize the visual structure the employee actually experiences.

### E. Reveal complexity progressively

- Keep the common path simple and immediately available.
- Put infrequent secondary actions in a clearly labeled secondary area or overflow menu.
- Reveal dependent fields when the user's selection makes them relevant.
- Keep errors, required warnings, important statuses, and the primary action visible; they must not disappear into an overflow menu.
- Do not hide a frequently used action just to make the screen look cleaner.

### F. Reduce cognitive load

- Maintain a consistent visual hierarchy and predictable component behavior across screens.
- Use whitespace to separate meaningful groups, without turning it into excessive vertical height.
- Keep colors, badges, icons, shadows, and font sizes restrained; do not make every element compete for attention.
- Prefer recognition over recall: readable selected values, useful search suggestions, and context beside actions.
- Use short, concrete microcopy. Keep longer guidance available where needed rather than repeating it across the page.
- Explain empty states with one useful next action instead of filling the screen with placeholder panels.
- Preserve work during navigation, validation errors, and recoverable request failures.

### G. Judge minimalism by task completion

During design review, walk through the common user journeys and record the clicks, scrolling, repeated entries, context switches, and time needed to complete them. Compare the proposed flow with the existing one.

Ask:

1. Can the user immediately identify the page's purpose and the next action?
2. Can a frequent operation be reached and completed more directly?
3. Does every visible field, card, action, and decoration help the current task?
4. Can a container or step be removed without losing meaning or safety?
5. Has anything become harder to discover, read, reach, or use with a keyboard?

Do not impose one universal maximum click count or card count on every feature. The requirement is the **shortest clear, usable, and appropriately safeguarded path to the user's goal**.

## 3. Brand and color

Use the supplied GenAir logo asset. Preserve its proportions, clear space, and legibility; do not recreate the logo as ordinary text or recolor it to match individual screens.

### Core palette

| Role / token     | Value     | Intended use                                                                          |
| ---------------- | --------- | ------------------------------------------------------------------------------------- |
| `iceWhite`       | `#F5F5F7` | Application canvas, cards, neutral controls, field surfaces.                          |
| `white`          | `#FFFFFF` | Highlight shadow, primary-button text, selected icon details.                         |
| `charcoal`       | `#1E2022` | Main text, strong emphasis, dark confirmation controls, mobile navigation background. |
| `textBody`       | `#45484D` | Supporting body text where used.                                                      |
| `textMuted`      | `#6E7178` | Captions, descriptions, secondary metadata, table headers.                            |
| `placeholder`    | `#9A9DA3` | Placeholder content.                                                                  |
| `disabledText`   | `#B5B7BC` | Disabled control text.                                                                |
| `primary`        | `#1F7FDB` | Primary action, active indicators, focus and emphasis.                                |
| `primaryHover`   | `#3591EA` | Primary-button hover.                                                                 |
| `airBlue`        | `#E1EDFA` | Selected tabs, navigation selections, informational surfaces.                         |
| `airBlueStrong`  | `#B8D3F2` | Stronger blue tint where required.                                                    |
| `airBlueOutline` | `#A7C6EA` | Blue outlines and progress details.                                                   |
| `surfaceHover`   | `#EAEAEF` | Hover treatment on interactive neutral rows.                                          |
| `divider`        | `#E2E3E8` | Subtle separators.                                                                    |
| `outline`        | `#C9CBD1` | Outlined/dashed controls.                                                             |
| `statusGray`     | `#8A8D93` | Neutral status indicators.                                                            |
| `statusBlue`     | `#3E7BC4` | Blue status indicators.                                                               |

### Semantic-color details

The current soft theme uses `danger: #1668BD`, `dangerSurface: #DCEBFA`, and `errorSurface: #EDF5FD`. This means an action named “danger” in code is **not necessarily red**. Other older tokens still define red error, amber warning, and green success colors.

For new work, reuse the actual component's semantic treatment rather than assuming a conventional red/green palette. Explain errors and destructive actions with explicit text and appropriate icons. Do not rely on color alone to communicate meaning.

Blue should remain selective. Most of the screen is neutral; applying blue to every card, label, and icon weakens the action hierarchy.

## 4. Typography

### Font families

| Purpose                        | Font stack                       |
| ------------------------------ | -------------------------------- |
| Hebrew and general UI          | `'Heebo', system-ui, sans-serif` |
| Identifiers and technical text | `'JetBrains Mono', monospace`    |

The app currently loads Heebo weights **300, 400, 500, 600, 700, 800** and JetBrains Mono weights **400, 500** through Google Fonts. System/monospace fallbacks apply if those fonts cannot load.

Use Heebo for Hebrew headings, body copy, navigation, buttons, fields, and captions. Use the monospace family selectively for identifiers, SKUs, or other technical strings; not for paragraphs of Hebrew text.

### Observed type hierarchy

These are component-level conventions, not a single globally enforced typography scale.

| Element                    | Typical size | Weight                         |
| -------------------------- | ------------ | ------------------------------ |
| Main page heading          | 32px         | 800                            |
| Project identity heading   | 28px         | 800                            |
| Prominent KPI              | 26px         | 800                            |
| Section/card heading       | 19–20px      | 700                            |
| Top-bar title              | 18px         | 700                            |
| Row title / upload heading | 15–17px      | 600–700                        |
| General component text     | 14–15px      | 400–500                        |
| Field label                | 13–14px      | 600                            |
| Standard action text       | 13–16px      | 600; primary actions often 700 |
| Supporting metadata        | 12–13px      | 400–600                        |
| Compact navigation eyebrow | 11px         | 600                            |

Use hierarchy through size, weight, and muted color, rather than many font families. Body text must remain readable; captions must not become the primary content style.

Supporting multiline copy often uses approximately **1.5 line-height**. This is an observed component pattern, not an app-wide custom line-height token. Avoid tight leading in Hebrew paragraphs.

## 5. RTL and mixed-direction content

The application theme is RTL. Hebrew text and page composition should feel native, rather than like a mechanically flipped English dashboard.

- Navigation sits on the **right** on desktop.
- Labels and Hebrew content align to the logical start.
- Use logical spacing properties such as `padding-inline-start` and `margin-inline-end`.
- Keep email addresses, phone numbers, SKUs, dates, currency values, and technical identifiers readable with deliberate LTR isolation where appropriate.
- Do not reverse character sequences or manually reorder an identifier to make it “fit” RTL.
- Preserve intended semantic column ordering; do not blindly reverse every icon or row.
- Test actual Hebrew strings, long project names, and mixed Hebrew/Latin filenames.

**Implementation detail:** the app uses Emotion RTL processing. Shared shadow values are exposed through CSS variables to preserve both shadow layers consistently; reuse those tokens rather than manually flipping shadow directions.

## 6. Surfaces, light, and depth

### Light model

The virtual highlight comes from the **upper left**, with a darker shadow toward the **lower right**. Neutral elements share the same pale surface color, so these two shadow layers define the edge.

### Primary surface recipes

```css
/* Raised card */
background: #f5f5f7;
border-radius: 24px;
box-shadow:
  8px 8px 18px #dcdce2,
  -8px -8px 18px #ffffff;

/* Compact raised control */
box-shadow:
  4px 4px 10px #dcdce2,
  -4px -4px 10px #ffffff;

/* Recessed input */
box-shadow:
  inset 4px 4px 9px #dcdce2,
  inset -4px -4px 9px #ffffff;

/* Primary action */
background: #1f7fdb;
color: #ffffff;
box-shadow:
  5px 5px 12px rgba(31, 127, 219, 0.3),
  -5px -5px 12px #ffffff;
```

These illustrate the existing recipes. In application code, consume the shared theme/shadow tokens rather than introducing duplicate literal definitions.

| Depth                 | Visual meaning                            | Typical use                                |
| --------------------- | ----------------------------------------- | ------------------------------------------ |
| Flat                  | A quiet background or content grouping    | Low-emphasis internal structure.           |
| Raised                | A surface resting above the canvas        | Cards, major panels.                       |
| Raised soft / compact | Smaller tactile elevation                 | Pills, rows, buttons, icon tiles.          |
| Inset                 | A recess, editable area, or pressed state | Inputs, tracks, selected/pressed controls. |

Do not place a strong raised shadow around every nested text element. Keep the hierarchy clear: page → card → control. Use flatter internal regions when another elevated surface would add noise.

## 7. Shape and spacing

### Corner radii

| Token / pattern         | Radius                                    |
| ----------------------- | ----------------------------------------- |
| Main card               | 24px                                      |
| Internal panel          | 20px                                      |
| Badge                   | 14px                                      |
| Checkbox                | 9px                                       |
| Pill / circular control | 999px, with equal dimensions for a circle |
| Sidebar shell           | 28px in the current shared component      |

### Spacing vocabulary

The app has a practical spacing vocabulary rather than a strictly enforced 4px-only scale. Existing components deliberately use values such as 10, 14, 18, and 22px.

| Relationship                   | Typical spacing                                      |
| ------------------------------ | ---------------------------------------------------- |
| Closely related text           | 4–6px                                                |
| Icon/text and compact controls | 6–12px                                               |
| Related fields / row actions   | 12–16px                                              |
| Card-to-card grids             | 24px                                                 |
| Major page sections            | 28px                                                 |
| Default card padding           | 24px                                                 |
| Compact card padding           | Usually 16–20px, depending on the approved component |

Use generous outer spacing and tighter spacing within a semantic group. Do not make a small inline action look like a large page section by giving it excessive padding.

## 8. Application shell and navigation

### Desktop

- Opaque pale canvas; a sticky right-side navigation region and flexible main content.
- The app layout reserves a **272px sidebar slot**. The standalone Sidebar component has a 280px default width, but the app overrides it to fill its slot.
- Sidebar contains the GenAir logo, a small section label, navigation pills, and a bottom logout action.
- Active navigation uses a pale blue treatment and an active indicator.
- Main content uses `16px 24px 48px` padding and a **28px** section gap.
- Top bar is a raised rounded card, minimum **76px** high, with title/context and user identity. It wraps when needed.

### Mobile

- At **899px and below**, the shell replaces the sidebar with a fixed bottom navigation bar.
- The app-level bottom bar is charcoal, inset **12px** from the sides and bottom, and **76px** high. Its component has separate standalone defaults that the app layout overrides.
- Active navigation gets a pale blue pill; labels and icons remain visible.
- Main content padding becomes `16px 16px 112px` so the bottom controls can clear navigation.
- Do not place critical actions behind the fixed navigation. Verify the actual viewport, not only a full-page screenshot.

Navigation is permission-aware: unavailable screens should not appear as usable destinations. UI visibility complements server authorization; it does not replace it.

## 9. Page composition

Most screens follow this structure:

1. **Context and identity:** page/entity title, identifier, status, and relevant metadata.
2. **Primary tools:** search, filters, and the main creation/action control.
3. **Working content:** a table, card collection, form sections, or an entity detail view.
4. **Supporting sections:** documents, related records, team, notes, or history.
5. **Completion actions:** save/review/confirmation controls in a deliberate, stable location.

Group information by the employee's task. A section card should have a clear title, optional icon tile, short explanation where useful, content, and relevant actions.

### Entity detail pages

Use a prominent header card for identity and status. Keep technical integration metadata secondary. Related sections use the same surface language; avoid switching visual systems between project, customer, apartment, task, and quotation screens.

### Forms

Break long forms into meaningful cards. Use multi-column layouts when the fields fit comfortably, then stack on smaller screens. Labels stay above their fields. Required and inherited/read-only values must be understandable without relying solely on color.

### Quotation footer — explicit approved layout

On desktop, the footer has **exactly two equal summary cards**: totals on the right and review/approval on the left. The delete card occupies its **own full-width row below both**, with a full-width neutral delete pill.

Use a 24px gap. On mobile, stack the cards. Do not use an unconstrained auto-fit grid that puts the delete card alongside the two summaries on a wide screen.

## 10. Buttons and action hierarchy

| Variant   | Appearance                                                     | Use                                                          |
| --------- | -------------------------------------------------------------- | ------------------------------------------------------------ |
| Primary   | Blue fill, white text, blue-tinted raised shadow               | Main positive action.                                        |
| Secondary | Pale blue fill, charcoal text                                  | Supporting highlighted action.                               |
| Neutral   | Pale raised pill, charcoal text                                | Edit, cancel, open, secondary actions.                       |
| Pressed   | Pale recessed surface                                          | Persistent pressed/selected treatment.                       |
| Dark      | Charcoal fill, pale text                                       | Strong confirmation, including confirmed quotation deletion. |
| Danger    | Blue danger-colored text, transparent surface, pale blue hover | Existing theme's semantic danger variant; do not assume red. |
| Dashed    | Transparent surface, dashed outline                            | Add/upload/placeholder-style action where specified.         |

### Dimensions

- Shared compact button: **44px** high, 13px text, 14px horizontal padding.
- Shared medium button: **48px** high, 15px text, 28px horizontal padding.
- Shared large button: **56px** high, 16px text, 32px horizontal padding.
- Circular variants use matching width and height.
- Quotation-specific approved controls override shared sizing: primary pills **52px**, compact pills **34px**, compact circles **36px**, delete action **44px**, inline delete confirmations **38px**.

Use the shared defaults unless the approved screen specifies a component-specific size. Avoid silently enlarging compact actions into prominent CTAs.

### States

- Hover subtly changes the surface or primary blue.
- Active/pressed changes the shadow inward.
- Disabled controls are visibly subdued and noninteractive.
- Loading controls prevent duplicate actions and preserve their footprint.
- The quotation primary-button disabled state has a screen-specific blue treatment; it is not the same as the generic neutral disabled style.

Destructive actions require clear intent and confirmation. Keep cancel available before dispatch; disable repeated submission while the request is pending.

## 11. Inputs, search, selection, and tabs

### Fields

- Opaque pale surface with an inset shadow; no dominant Material outline.
- Standard shared single-line field: **56px** high, **22px** horizontal padding, pill radius, **15px** text.
- Textareas use a **20px** radius and approximately `18px 22px` padding.
- Field labels are outside/above the input, typically 13–14px semibold.
- Placeholder text is lighter than entered text and is not a substitute for the label.
- Helper text is smaller and sits below the field.
- Focus retains the inset surface and adds a visible 2px-style ring treatment.
- Disabled and invalid states have explicit component treatments, including helper text.

### Search and autocomplete

Search is directly editable. Typing must not require opening an extra disclosure first unless the specific design calls for it. Suggestions use a rounded raised menu with clear hover/focus selection. Preserve readable selected labels and make clear/reset behavior discoverable.

### Tabs and chips

The shared system supports pill tabs, status tabs, and segmented controls. Selected state combines surface color and/or depth, not an underline alone. Counts are smaller and muted. Let groups wrap when the screen requires it; keep text readable instead of compressing it excessively.

## 12. Tables, rows, and information density

Tables are visually composed from rounded soft rows rather than a heavy bordered grid.

- Muted 12px semibold column headers.
- Shared row minimum height: **72px**.
- Row padding: approximately `10px 20px`; column gap: **16px**.
- Raised compact row shadow, 20px radius, pale fill.
- Main identity text is stronger than its identifier and metadata.
- Interactive rows have a clear hover treatment; static rows should not look clickable.
- Avatars, status pills, and compact actions should not overwhelm the primary content.
- Dense engineering editors may use more compact screen-specific rows.

Align headers with data columns. Long names should wrap or truncate deliberately without displacing important actions. Keep horizontal overflow inside a table/review region when necessary, not across the whole page.

## 13. Icons, avatars, and badges

- Reuse GenAir's icon registry and bundled assets. The shared icon defaults to **24px**; section headings may use larger icons inside rounded raised tiles.
- The registry includes existing PNG assets and MUI component alternatives for colored rendering. Preserve the established visual family rather than introducing unrelated emoji or illustration styles.
- Use icon-plus-label for important actions. Give icon-only controls an accessible name.
- Decorative icons should not produce redundant screen-reader announcements.
- Use circular initials avatars and compact avatar stacks for people/teams.
- Status badges combine a concise label with a small indicator and restrained surface treatment. Use actual feature status definitions rather than inventing a new color map.
- Keep technical IDs visually secondary, often in a monospace style.

## 14. Files, uploads, notices, and dialogs

### Documents and uploads

Folder/file rows reuse rounded surfaces, recognizable icons, names, secondary metadata, and explicit actions. The upload zone looks recessed; dragging can highlight it with pale blue. Include a visible file-picker action so drag-and-drop is not the only path.

In compact layouts, the upload icon, instruction text, and action share a deliberate row; on mobile they stack. Display validation or upload errors near the affected action and preserve the user's context.

### Feedback

Notices are soft rounded banners, commonly pale blue, with an icon, readable explanatory text, and relevant actions. Use text and structure to distinguish informational, blocked, error, empty, and successful states.

Loading is visibly pending; empty means there is no content; an error means content could not be loaded or an action failed. Do not present these as interchangeable blank cards.

### Dialogs and inline confirmations

Match the surrounding typography, surfaces, rounding, and action hierarchy. Use concise consequence text, a clear confirmation, and a cancel path. Preserve keyboard access and focus management.

Some legacy generic dialogs still have 13px corners and Rubik typography. Those are implementation inconsistencies, not a direction to copy into new GenAir screens.

## 15. Responsive behavior

There are multiple intentional breakpoints, not one universal mobile conversion:

| Boundary                       | Observed behavior                                                               |
| ------------------------------ | ------------------------------------------------------------------------------- |
| Shell ≤899px                   | Sidebar becomes fixed bottom navigation.                                        |
| MUI responsive component rules | Some component grids change at MUI breakpoints; inspect the relevant component. |
| Quotation ≤600px               | Summary/metadata layouts use a single column and compact editor arrangements.   |

Use flexible grids, wrapping action rows, `min-width: 0`, and logical alignment. Keep forms and actions usable at narrow widths. At desktop sizes, preserve the intended composition instead of allowing auto-fit to invent additional columns.

**Verification recommendation:** compare a wide desktop viewport, a narrower desktop/tablet viewport, and a 390px mobile viewport. The quotation-footer checks currently use 1440px, 1100px, and 390px. Check actual control visibility above fixed navigation and document-level horizontal overflow.

## 16. Motion and interaction feedback

Existing shared controls commonly transition **box-shadow and background color over 0.2 seconds with easing**. Motion should explain hover, focus, pressing, selection, or loading; it should not compete with work content.

### Principle: make progress perceptible

**Cards, sections, panels, and other content containers should use subtle, purposeful motion to give the user a sense of forward movement and continuity.** A user action should produce a clear visual response: work has started, content is changing, a step has completed, or the next part of the workflow is ready.

These container-motion rules are approved design direction for future implementation, not a claim that every current screen already implements them. Apply them to meaningful UI groups rather than animating every HTML `div` independently.

### Motion patterns

| Situation                                | Preferred treatment                                                                                                      | Purpose                                                             |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| A new section or card becomes available  | Brief fade-in with a small vertical translation, approximately 4–8px.                                                    | Show where new content entered without an abrupt appearance.        |
| Moving to the next form or workflow step | Transition the changing content region; keep the surrounding shell stable and update the step indicator.                 | Make forward progress understandable.                               |
| Expanding a meaningful section           | Smoothly reveal its content and update the disclosure indicator.                                                         | Preserve the relationship between the trigger and revealed content. |
| Loading a section                        | Use a stable placeholder/skeleton or a localized loading indicator; optionally a restrained shimmer.                     | Communicate ongoing work while preserving the page structure.       |
| Replacing loaded content                 | Briefly crossfade the affected region while keeping its dimensions stable where practical.                               | Avoid a flash or page-wide jump.                                    |
| Saving or completing an operation        | Transition from pending to a short saved/completed state, such as a checkmark and concise text.                          | Confirm that the requested work actually finished.                  |
| Uploading or processing multiple items   | Show per-item status and actual completed-item counts; use a determinate bar only when meaningful progress is available. | Make longer operations understandable and traceable.                |
| Recoverable failure                      | Stop the pending animation and show an explicit error and retry path in the affected region.                             | Make it clear that the operation needs attention.                   |

### Timing and movement

The following are recommended starting values, not existing global motion tokens:

- **Interaction feedback:** approximately 120–200ms.
- **Card/section entry or content transition:** approximately 180–260ms.
- **Expansion/collapse:** approximately 200–300ms, adjusted for content size.
- **Optional stagger:** approximately 30–50ms between a few related groups, with the sequence kept brief. Do not make a long list wait for every row to animate.
- Prefer gentle ease-out for entering content and a smooth, restrained curve for size transitions. Avoid overshoot and spring-like bouncing in routine work screens.

Prefer opacity and small transforms for entry effects. Use size animation only where expansion needs to be understood, and avoid repeatedly animating large page layouts. Do not animate the entire app shell when one card changes.

### Progress must reflect actual state

Motion may simulate the _feeling of continuity and forward movement_, but must not fabricate completed work. Start pending feedback when an operation starts, and show completion only when the operation succeeds. When a percentage is unavailable, use an indeterminate indicator or a real status label rather than an invented percentage. Do not add artificial delays to make an animation play.

For optimistic interactions, make pending state and failure recovery reliable; do not present an unconfirmed save as a final success. Stop loading motion on success, failure, or cancellation.

### Minimalism and accessibility constraints

- Animate only the region whose state changed. Static reference information should stay still.
- Avoid decorative floating animations, large bounces, constant pulsing, and repeated entry animations on every rerender or keystroke.
- Keep reading position, input focus, entered values, and scroll context stable. An animation must not move a control away from the user while they are trying to use it.
- Keep actions usable immediately; motion must not create extra clicks or waiting.
- Avoid unnecessary layout shifts, flashing, and multiple simultaneous competing animations.
- Respect `prefers-reduced-motion`: remove translation, stagger, shimmer, and nonessential transitions while retaining clear static pending/success/error feedback.
- Pair visual feedback with readable status text and appropriate accessible announcements for meaningful asynchronous changes. Do not announce every animation frame.

This document does not assert that the current application already has a complete global reduced-motion implementation.

## 17. Accessibility and usability requirements

Soft UI has subtle edges, so usability cannot depend on shadows alone.

- Keep field labels, helper messages, focus indicators, and actionable text explicit.
- Use real buttons/links with keyboard support and accessible names.
- Preserve a visible focus state on recessed controls.
- Do not use muted captions for essential instructions.
- Pair color changes with labels, icons, or structural feedback.
- Ensure controls remain reachable above fixed navigation and within narrow layouts.
- Check long Hebrew content, text zoom, mixed-direction strings, and loading/error states.
- Maintain usable touch areas; compact visual controls may require a larger effective hit area.
- Check contrast in the rendered interface rather than assuming pale blue or muted gray is sufficiently readable.

These are design acceptance criteria and recommendations, **not a claim of completed WCAG certification**.

## 18. Source of truth and existing inconsistencies

Use this order when implementing a screen:

1. The latest explicitly approved screen reference and user corrections for that screen.
2. Shared GenAir theme tokens and components.
3. Existing matching patterns elsewhere in the app.
4. New component-level styling only where the first three do not define the behavior.

Shared code contains older purple gradients, older button-color tokens, generic red/green colors, Rubik dialog styles, and some screen-specific numeric overrides. Their presence does not make them part of the current cohesive Soft UI direction. Reuse the active `palette`, `softShadow`, `radius`, `font`, and relevant component definitions.

The app does not currently establish a complete dark-mode design system, a strict global spacing/type scale, or a glass surface system. Do not invent those as existing GenAir conventions.

## 19. Implementation source map

Paths are relative to `Gen-Air-Frontend`.

| Concern                                 | Source                                                                                                             |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Palette, fonts, radii, heights, shadows | `src/constants/theme.constants.ts`                                                                                 |
| Surface depth vocabulary                | `src/constants/surface.constant.ts`                                                                                |
| RTL and MUI theme configuration         | `src/context/MuiThemeContext.tsx`                                                                                  |
| Font loading                            | `index.html`                                                                                                       |
| Shadow construction                     | `src/utilities/shadow.utility.ts`                                                                                  |
| Responsive shell threshold              | `src/constants/layout.constant.ts`                                                                                 |
| App shell and navigation placement      | `src/layouts/AppLayout.tsx`, `src/layouts/AppLayout.style.ts`                                                      |
| Shared page structure                   | `src/pages/page.style.ts`                                                                                          |
| Cards and section headers               | `src/components/Card/`, `src/components/CardHeader/`                                                               |
| Buttons and variants                    | `src/components/Button/`                                                                                           |
| Fields and suggestion menus             | `src/components/TextField/`, `src/components/Autocomplete/`                                                        |
| Tabs                                    | `src/components/Tabs/`                                                                                             |
| Tables                                  | `src/components/DataTable/`                                                                                        |
| Desktop/mobile navigation               | `src/components/Sidebar/`, `src/components/MobileBottomNav/`                                                       |
| Icons and assets                        | `src/constants/icon.constant.ts`, `src/components/Icon/`, `src/assets/icons/`                                      |
| Uploads and feedback                    | `src/components/DropZone/`, `src/components/NoticeBanner/`                                                         |
| Quotation layout and size exceptions    | `src/pages/quotations/quotation.module.css`, `src/constants/quotation.constant.ts`                                 |
| Full-width quotation delete action      | `src/pages/quotations/components/QuotationSummary.tsx`, `src/pages/quotations/components/QuotationDelete.style.ts` |

## 20. Design-review checklist

- [ ] The screen has a clear purpose and a clear primary next action.
- [ ] Common actions require no unnecessary clicks, scrolling, repeated entry, or page changes.
- [ ] Known context and sensible defaults reduce employee effort.
- [ ] Cards and nested containers each have a meaningful purpose; related content is grouped rather than fragmented.
- [ ] Headers, padding, and controls are compact enough to leave room for the actual work.
- [ ] Secondary complexity is disclosed progressively without hiding frequent actions, errors, or required warnings.
- [ ] A reduction in visual clutter has not made actions harder to discover or use.
- [ ] Destructive/consequential actions retain appropriate safeguards.
- [ ] Hebrew/RTL composition is intentional; mixed-direction values remain readable.
- [ ] Heebo and the existing text hierarchy are used consistently.
- [ ] Canvas and surfaces use the pale neutral palette.
- [ ] Raised and recessed shadows follow the same light direction.
- [ ] Cards, fields, and pills use their established radii and sizes.
- [ ] Blue emphasizes actions and selection without dominating every surface.
- [ ] Desktop composition matches the approved reference, including card spans and action placement.
- [ ] Fields are directly usable and labels do not depend on placeholders.
- [ ] Hover, focus, disabled, loading, empty, error, and confirmation states are accounted for.
- [ ] Container motion makes meaningful state changes and workflow progress perceptible without animating every element.
- [ ] Pending and completion feedback reflect actual operation state; no artificial percentages or delays are introduced.
- [ ] Animations preserve focus, scroll position, layout stability, and immediate access to actions, with reduced-motion alternatives.
- [ ] Mobile controls remain visible above fixed navigation.
- [ ] Table/editor overflow is contained rather than widening the whole document.
- [ ] Actual rendered screenshots are compared with the reference, not only component structure or CSS values.

## 21. Reusable design brief

> Design this screen as part of GenAir's Hebrew RTL CRM. Prioritize minimalism and minimum-effort task completion: fewer unnecessary clicks, less scrolling, fewer meaningful containers, less repeated input, and a clear next action. Keep frequent actions visible, use contextual defaults, and reveal secondary complexity progressively. Avoid oversized headers, excessive whitespace, duplicated information, and deeply nested cards. Preserve discoverability, accessibility, and safeguards for consequential actions. Use light neumorphism / Soft UI: an opaque `#F5F5F7` canvas and matching rounded surfaces, upper-left white highlights and lower-right soft gray shadows, recessed pill inputs, Heebo typography, charcoal text, and restrained `#1F7FDB` primary actions with pale blue selected states. Use approximately 24px card radii, 20px internal panels, pill controls, 24px grid gaps, and 28px major section spacing, without letting decorative spacing make workflows unnecessarily long. Preserve a right-hand desktop sidebar and charcoal mobile bottom navigation with adequate bottom clearance. Reuse GenAir's existing components and icon assets. Follow the approved screen composition exactly, including full-width rows and action positions. Use subtle card and section transitions to make workflow progress perceptible: brief fades, small movements, stable loading placeholders, and clear completion feedback tied to actual state. Keep the shell, focus, and scroll position stable; honor reduced-motion preferences and never add artificial delays or progress percentages. Verify the actual rendered desktop and mobile layouts. Treat the latest screen reference as authoritative over generic auto-fit behavior.
