# GenAir — Design Language

> **Design specification, updated 6 November 2026.** Use the component vocabulary in the local `Smartbase-Client-Package` repository at commit `8f14318f823603e66e03e3592a6693678cd8d245`, adapted to a **blue and white** GenAir brand. Check each component and business screen against the reference as it is touched.
>
> **Scope:** visual language, component behavior, responsive composition, RTL, accessibility, and implementation guidance. The Smartbase package is a design reference; GenAir does not currently depend on it. Reuse or adapt a component only after checking its API, dependencies, accessibility, and fit with the current app.

## 1. Identity and source of truth

GenAir is a Hebrew-first, RTL business application. Its new visual language follows the Smartbase component family: a pale canvas; white and translucent floating surfaces; fine borders and highlights; slate text; rounded controls; and focused, purposeful motion. **All brand accents are blue.** Purple and violet gradients, glows, selection fills, and focus rings in Smartbase become blue equivalents in GenAir.

The interface should feel clear, light, and responsive. Glass is a surface treatment for cards, menus, sheets, and floating panels, not a reason to obscure content. Use a solid white fallback whenever blur or transparency reduces legibility.

When sources disagree, use this order:

1. The latest explicitly approved reference and corrections for the specific screen, including its functional layout.
2. This GenAir design language and its blue palette.
3. The current Smartbase component implementation for shape, structure, states, and motion, with purple accents translated to blue.
4. Existing GenAir code for product behavior, data structure, routes, permissions, and temporary implementation constraints.

Smartbase contains older solid buttons and fields alongside newer glass and choice components. Match the **component appropriate to the interaction** rather than mixing every variant on one screen. Do not import Smartbase purple literals or treat a legacy GenAir soft-shadow token as the new visual target.

## 2. Product and workflow principles

Each screen should expose the smallest clear set of information and actions needed for the employee's current task. Keep one primary next action prominent. Place frequent actions beside the record or field they affect; show secondary actions with lower emphasis. Use known customer, project, or document context to avoid repeated selection.

Keep search directly editable, preserve filters and return position where practical, and retain entered work after validation or request failures. Use columns when they help comparison; do not add cards only to fill space. A card marks a meaningful information group or interaction boundary. Prefer alignment, typography, and a fine divider over nested cards.

Reduce unnecessary clicks and scrolling while keeping destructive, financial, and other consequential actions appropriately safeguarded. Do not hide frequent actions, errors, or required information inside an overflow menu. Judge a design by the user journey, not by a universal card or click count.

## 3. Blue and white color system

The palette below is the **target adaptation**, not a list of currently implemented GenAir tokens. It combines Smartbase's white/slate surface system with GenAir's existing blues. Create or update shared theme tokens before applying it broadly; do not scatter these values as new literals across components.

| Role          | Target value                | Use                                                                        |
| ------------- | --------------------------- | -------------------------------------------------------------------------- |
| Canvas        | `#F8FAFC`                   | Page background and quiet regions.                                         |
| Surface       | `#FFFFFF`                   | Controls and opaque glass fallback.                                        |
| Glass card    | `rgba(255, 255, 255, 0.71)` | Main translucent cards over a calm canvas.                                 |
| Glass summary | `rgba(255, 255, 255, 0.90)` | Dense summaries requiring stronger readability.                            |
| Ink           | `#0F172A`                   | Main text and high-emphasis icons.                                         |
| Muted text    | `#64748B`                   | Secondary copy, metadata, inactive controls.                               |
| Subtle border | `#E2E8F0`                   | Input, choice, tooltip, and divider edges.                                 |
| Primary blue  | `#1668BD`                   | Filled action, link, selected text, and focus outline.                     |
| Bright blue   | `#1F7FDB`                   | Blue decoration, progress, selected icons, and the lighter end of accents. |
| Deep blue     | `#0F5CA8`                   | Darker end of filled gradients and hover treatment.                        |
| Soft blue     | `#E1EDFA`                   | Selected/hover backgrounds and informational tint.                         |
| White on blue | `#FFFFFF`                   | Text and icons on sufficiently dark blue fills.                            |

Use `linear-gradient(135deg, #0F5CA8, #1668BD)` for a prominent filled blue action or selected thumb where the reference uses a purple gradient. Use a pale blue tint or a thin blue border for lower-emphasis selection. Apply blue to actions, focus, progress, and meaningful selection; do not tint every card.

White text on `#1668BD` has roughly **5.6:1** contrast; white text on the brighter `#1F7FDB` has roughly **4.1:1**. Therefore the bright blue is an accent, not the sole background behind ordinary white button text. Check rendered contrast for gradients, transparency, disabled states, and text over imagery.

The brand palette remains blue and white with slate neutrals. Error, warning, and success states may use semantic colors when needed, as Smartbase's `NoticeCard` does; pair them with readable text and an icon. Never recolor an error as an ordinary blue information state merely to preserve the brand palette.

## 4. Typography and direction

Smartbase's shared MUI theme and Storybook use **Rubik** for the main UI, with JetBrains Mono for technical values. Its `SummaryCard` and some Hebrew-first components use Heebo for denser Hebrew copy. GenAir currently loads Heebo as its default. The target is Rubik for headings, navigation, buttons, labels, and ordinary controls; Heebo may remain in dense Hebrew body or summary content where it reads better. Keep a consistent type choice within each screen, and load the selected weights before switching a component. Use JetBrains Mono sparingly for IDs, codes, and technical strings.

Follow the component's hierarchy rather than imposing one global size scale. Reference examples: Smartbase `Card` title **14px/700** and subtitle **12px**; `FieldLabel` **15px/600**; `TextField` input **16px/600**; `FlowHeader` title **22px/700**; `SummaryRow` label **13px** and value **14px/600**; `NoticeCard` body **15px**. Keep page headings clearly above card headings and keep essential text out of caption size.

Set the page and Hebrew content to RTL. Use logical `inline-start`/`inline-end` alignment for icons, padding, dividers, and actions. Isolate phone numbers, dates, email addresses, IDs, and Latin product codes so they remain readable in RTL text. A visual reversal must not change keyboard order or the meaning of previous/next actions. Test long Hebrew labels and text zoom.

## 5. Surface, depth, and shape

The default Smartbase `Card` is a **22px** rounded section with **16px** padding, **12px** internal gap, a translucent white fill, a fine white rim, backdrop blur, soft floating shadow, and an inset white highlight. GenAir uses a stronger near-white fill and omits per-card backdrop blur because cards repeat densely across CRM screens. Reserve blur for menus, the app shell, and dialogs. The `SummaryCard` uses a stronger white fill, the same **22px** radius, light dividers, and compact label/value rows. `FlowHeader` uses an opaque white **20px** rounded surface. Floating menus and tooltips use white or glass with a fine slate border and a clear shadow.

Depth comes from **separation and light**. Smartbase itself uses soft floating shadows on cards, menus, and overlays, including white inset highlights on its glass card. GenAir's old matched light/dark raised and recessed shadows are a different treatment and are not part of this language. Use the shared `theme.glass.shadow` for a floating panel, `theme.glass.shadowSmall` for compact depth, `theme.glass.edge` for a quiet row or nested panel, and `theme.glass.selectedEdge` with a pale blue fill for selection. Do not put a floating shadow around every row. A glass card needs a stable pale canvas underneath; avoid stacking several translucent cards where text and borders become muddy. If blur is unsupported, expensive, or visually noisy, render an opaque white surface with the same edge and shadow hierarchy.

Use the radius of the component being adapted: about **22px** for cards, **20px** for flow headers, **17px** for the basic text field, **14–16px** for choice rows and select triggers, **12px** for notices, and full pills for segmented controls, autocomplete search, and flow footer actions. Do not force a single radius onto every component.

For spacing, start with the component's own dimensions: card padding **16px**, card content gap **12px**, notice regular padding **18px 20px**, compact notice **12px 14px**, and choice-list gap **8px**. Use larger outer gaps between meaningful page sections than within a section. Keep the main task visible near the top; avoid decorative whitespace that pushes working content below the fold.

## 6. Component patterns

| Need                       | Smartbase reference                                       | GenAir design rule                                                                                                                              |
| -------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Main section               | `Card`, `CardHeader`                                      | Glass/white section, short title and optional subtitle/action. The card header may use a subtle heading rule; keep content and actions aligned. |
| Totals or record summary   | `SummaryCard`, `SummaryRow`                               | Stronger white surface; compact label/value rows with fine dividers and readable values.                                                        |
| Main and secondary actions | `Button`, `FlowFooter`                                    | Blue filled primary; white/slate outlined or quiet secondary. Preserve component-specific geometry and clear disabled/loading states.           |
| Icon action                | `IconButton`                                              | Circular hit area, subdued neutral default, blue focus and selected state, accessible name.                                                     |
| Single value               | `FieldLabel`, `TextField`                                 | Label above a white rounded field; helper/error below. Do not use placeholder as label.                                                         |
| Search and suggestions     | `Autocomplete`                                            | Immediately editable pill search, floating list, clear action, highlighted match, explicit loading/empty states.                                |
| Selection                  | `Segmented`, `ChoiceList`, `ChoiceButtons`, `SheetSelect` | Blue selected state plus border/fill/check or thumb; clear unselected state and keyboard focus.                                                 |
| Boolean state              | `CheckBox`, `Switch`, `SwitchRow`                         | White/slate idle state and blue checked track/fill; text label stays visible.                                                                   |
| Files or categories        | `CategoryChip`, `CategoryCarousel`                        | Compact labeled icons/chips; blue active fill and small blue shadow, muted inactive state. Show that the row scrolls when it does.              |
| Status and help            | `NoticeCard`, `Tooltip`, `ProgressBar`                    | Fine bordered notice with icon and concise copy; small readable tooltip; determinate progress only when real progress exists.                   |
| Guided flow                | `FlowHeader`, `FlowFooter`, `BottomSheet`                 | Clear step title and close action; stable bottom action area; white/glass mobile sheet with visible grip and safe-area clearance.               |
| Contextual reveal          | `MorphSurface`, `MorphTextArea`, `MorphOverlay`           | Use only when expanding in place reduces effort; blue active border/glow and a stable text-entry/focus transition.                              |

### Buttons and action hierarchy

Smartbase's base `Button` has an older **7px** primary/secondary variant, while its newer `active` and `outlined` choice treatments use a **16px** radius and at least **48px** height. `FlowFooter` uses **54px** pill actions. Match the selected component's purpose and geometry; do not mix these styles arbitrarily within one action group. Translate every purple gradient, border, and glow to blue. The main positive action uses the deep-to-primary blue fill with white text. Secondary actions use white with a subtle border and ink text. Selection actions can use pale blue fill and a clear blue border.

Hover and press states may slightly lift or scale a choice button; the Smartbase choice treatment uses a restrained spring and a white top highlight. Keep the footprint stable, avoid moving neighboring controls, and remove transform motion under `prefers-reduced-motion`. Loading keeps the button's label space, prevents duplicate submission, and provides a readable pending state. Destructive actions need explicit consequence text and confirmation.

### Fields, search, and selection

The basic Smartbase `TextField` is white with a **17px** radius and no dominant MUI outline. GenAir's adaptation must still provide a visible blue focus ring or border because a borderless field cannot rely on surface difference alone. Disabled and invalid states must include readable text or helper feedback.

The newer Smartbase `Autocomplete` has a **54px** pill search surface, soft white gradient, subtle depth and glass, a clear control, and a floating options list. Options are about **48px** high, with a primary label and optional secondary line. Keep the selected value visible; expose loading, no results, clear, keyboard navigation, and focus. `SheetSelect` uses a bordered **14px** trigger, at least **42px** high, and a bottom sheet on small screens. Do not require a disclosure click before a frequent search can accept typing.

The `Segmented` control uses an animated selected thumb: **36px** option height by default, **30px** compact, within a full pill. Translate the selected gradient to blue and retain a static selected state when motion is reduced. `ChoiceList` rows are at least **48px** high with **14px** corners; selected rows get a pale blue fill, blue border, and visible focus ring. Checkboxes and switches use white/slate inactive surfaces and blue active fills, with labels and controls reachable by keyboard.

GenAir's filter and status `Tabs` use one treatment across screens: a compact white pill with a fine edge, dark labels, muted counts, and a pale blue thumb with a blue edge that slides to the active tab. Variants may change width or wrapping, but not the selected color or surface treatment. Disable the slide under `prefers-reduced-motion`.

### Feedback, overlays, and progress

`NoticeCard` is a **12px** rounded, fine bordered message with icon, text, and an optional action. Keep status semantics distinct. Loading, empty, error, success, and disabled are separate states; a blank card is not a loading indicator. `Tooltip` is a small white bordered floating panel, not a substitute for a required field label.

`FlowFooter` is a white rounded-top action dock with a soft shadow, optional sticky behavior, and safe-area bottom padding. `BottomSheet` is a glass/white surface with a dimmed backdrop, rounded top corners, a visible grip, and independent scrolling. Keep close/cancel reachable and restore focus after dismissal. `ProgressBar` has a pale track and blue fill; display an actual fraction only when it reflects real completed work.

Use `MorphSurface` and `MorphOverlay` for contextual transitions where the user can understand the source and destination. Translate their purple stage, icon, border, and shadow to blue. Keep the underlying app stable and do not play a success transition before the operation succeeds.

## 7. GenAir page composition and navigation

Smartbase is a component library, so its components do **not** define GenAir's application shell, permissions, business pages, or quotation layout. Retain GenAir's right-side desktop navigation, RTL content order, permission-aware destinations, and mobile bottom navigation. The current app switches its shell at **899px and below**; maintain that functional breakpoint until a responsive redesign is explicitly approved. Restyle shell surfaces to the new pale canvas, white/glass panel, slate text, and blue active state. The current charcoal bottom bar is a legacy visual treatment, not the new target.

A page should generally present: context and title; visible search/filter/primary action; the working records or form; then supporting detail. Use cards for meaningful groups and compact rows for repetitive records. Smartbase does not supply a general data table, so keep GenAir's table behavior and reskin it with white/soft surfaces, fine dividers, clear hover/focus, and deliberate overflow. Avoid a heavy bordered spreadsheet and avoid a large raised card for every record when comparison is the main task.

**Approved quotation-footer layout remains authoritative:** on desktop, exactly two equal summary cards share the first row, totals on the right and review/approval on the left. The delete action occupies its own full-width row below them. Keep the **24px** gap and stack on mobile. Adapt the surfaces and controls to this guide without changing the approved composition or making the delete action visually primary.

For forms, group fields by the user's task, keep labels outside inputs, and prefill known context. On mobile, stack columns before fields become cramped. Keep frequent actions visible above the bottom navigation or in a clear action dock with enough scroll clearance. Preserve the app's routes and permissions; UI visibility never replaces server authorization.

## 8. Motion and responsive behavior

Smartbase uses short color and shadow transitions, an animated segmented thumb, spring-based bottom sheet and morph transitions, and local entrance/exit motion for autocomplete. Use motion to explain selection, disclosure, progress, and completion. Let the changed region move while the shell, focus, entered data, and scroll position remain stable. Avoid repeated card entrance animations on every render or keystroke.

Use a restrained hover/press response for controls, a short fade or small movement for newly revealed content, and a stable pending indicator for async work. Success feedback begins only after a confirmed success. Do not invent progress percentages or add artificial delays to showcase animation. Under `prefers-reduced-motion`, remove scale, travel, spring, shimmer, and stagger while retaining clear static state changes.

Check a wide desktop viewport, a narrower desktop/tablet viewport, and a **390px** mobile viewport. Verify RTL wrapping, long names, text zoom, and that sticky footers or fixed navigation do not cover controls. On narrow screens, keep floating surfaces within the viewport and contain table/editor overflow locally. Use a solid white fallback when backdrop blur reduces text contrast or performance.

## 9. Accessibility and interaction states

- Keep explicit labels, helper text, visible keyboard focus, and meaningful accessible names for icon-only actions.
- Use blue borders/rings plus shape, checkmark, or text to show selection; never depend on color alone.
- Keep text contrast sufficient on glass, tint, gradient, and disabled surfaces. Validate in the rendered UI.
- Preserve logical focus order and accessible dismissal for menus, sheets, dialogs, and morphing controls.
- Make compact visual controls usable through adequate hit areas, including touch and keyboard.
- Show clear pending, empty, error, success, disabled, and destructive states for every applicable flow.
- Keep reduced-motion alternatives and avoid announcing decorative animation frames.

These are design acceptance criteria, not a claim of completed accessibility certification.

## 10. Implementation and migration map

GenAir's shared theme, cards, fields, buttons, choices, feedback, navigation shell, and overlays are local adaptations of the Smartbase language. The Smartbase package targets MUI 5/6 while GenAir uses MUI 9, so GenAir retains its own component APIs rather than adding a package dependency. The legacy paired raised/recessed shadow tokens have been removed from the shared theme and component styles; repeated business rows now use a fine edge. Some business screens still need visual review for geometry, spacing, and interaction states. Verify the rendered screen after adapting one.

| Concern                   | Smartbase reference                                                                        | GenAir implementation area                                                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme and blue mapping    | `src/theme.ts`, `src/constants/font.constant.ts`                                           | `src/constants/theme.constants.ts`, `src/context/MuiThemeContext.tsx`, `index.html`                                                                             |
| Cards and summary         | `src/components/Card/`, `src/components/SummaryCard/`                                      | `src/components/Card/`, `src/components/CardHeader/`, page summaries                                                                                            |
| Buttons and icon controls | `src/components/Button/`, `src/components/IconButton/`, `src/components/FlowFooter/`       | `src/components/Button/`, page action rows                                                                                                                      |
| Fields and search         | `src/components/TextField/`, `src/components/Autocomplete/`, `src/components/SheetSelect/` | `src/components/TextField/`, `src/components/Autocomplete/`                                                                                                     |
| Selection                 | `src/components/Segmented/`, `src/components/ChoiceList/`, `src/components/Switch/`        | `src/components/Tabs/`, form selection controls                                                                                                                 |
| Status and loading        | `src/components/NoticeCard/`, `src/components/ProgressBar/`                                | `src/components/NoticeBanner/`, loading and status components                                                                                                   |
| Navigation and shell      | No Smartbase app shell                                                                     | `src/layouts/AppLayout.tsx`, `src/layouts/AppLayout.style.ts`, `src/components/Sidebar/`, `src/components/MobileBottomNav/`                                     |
| Records and files         | No general Smartbase data table                                                            | `src/components/DataTable/`, `src/components/DropZone/`, relevant page components                                                                               |
| Quotation composition     | No Smartbase quotation layout                                                              | `src/pages/quotations/quotation.module.css`, `src/pages/quotations/components/QuotationSummary.tsx`, `src/pages/quotations/components/QuotationDelete.style.ts` |

Paths in the Smartbase column are relative to `Smartbase-Client-Package`; paths in the GenAir column are relative to `Gen-Air-Frontend`. Smartbase story files show component variants, while source files define the actual styling and behavior. Check both before adapting a component. Do not assume a package component is drop-in compatible with GenAir's MUI version or current state management.

## 11. Design review checklist

- [ ] The screen follows the current task requirements and approved screen layout.
- [ ] Frequent actions are visible; known context is reused; cards and steps have a purpose.
- [ ] Purple brand values are translated to the shared blue palette; white text sits on a dark enough blue.
- [ ] Cards, fields, choices, notices, overlays, and footers use the corresponding Smartbase component treatment.
- [ ] Glass and blur retain readable text and an opaque fallback.
- [ ] Rubik/Heebo choices, type hierarchy, and Hebrew RTL/mixed-direction strings are intentional.
- [ ] Hover, keyboard focus, selected, disabled, loading, empty, error, success, and destructive states are clear.
- [ ] Motion reflects real state, preserves context, and has a reduced-motion alternative.
- [ ] Desktop and mobile navigation remain usable, with no content hidden by fixed or sticky UI.
- [ ] The rendered UI is compared with the intended component reference at desktop and mobile sizes.

## 12. Reusable design brief

> Design this GenAir screen for a Hebrew-first RTL CRM using the Smartbase component language at commit `8f14318f823603e66e03e3592a6693678cd8d245`: pale `#F8FAFC` canvas, white or lightly translucent rounded cards, fine borders and highlights, slate text, floating shadows, clear blue selection, and purposeful local motion. Replace purple brand accents with a deep-to-primary blue gradient (`#0F5CA8` to `#1668BD`), pale `#E1EDFA` tints, and blue focus rings. Use Rubik for the main UI and Heebo selectively for dense Hebrew content. Match the relevant Smartbase component's geometry and states; keep GenAir's right-side navigation, RTL workflows, permissions, and approved screen composition. Reduce unnecessary clicks and visual clutter, keep frequent actions visible, and verify accessible focus, contrast, reduced motion, and mobile clearance in the rendered UI. Treat this as the target direction; check existing GenAir components for migration work before claiming the screen matches it.
