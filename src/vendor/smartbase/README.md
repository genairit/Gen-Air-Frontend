# Smartbase component source in GenAir

The Autocomplete, Button, Card, Switch, Segmented, CheckBox, ProgressBar, and NoticeCard implementations here were copied from
`Smartbase-Client-Package` commit `8f14318`. GenAir's `Switch` and `Toggle`
components wrap them so existing screens keep their public props. The button
spring motion is adapted from the same revision's `Button.style.ts`.
The shared DatePicker carries the package's responsive calendar, range, and
interaction styles while retaining GenAir's MUI 9 day component and value API.

Local changes: blue and white theme mapping, TypeScript type imports for the
client compiler, reduced motion rules, and a browser vibration adapter in place
of the package's iOS haptics dependency. These files are local because the
package currently declares MUI 5/6 peers while this app uses MUI 9; importing
its prebuilt distribution would create a second MUI runtime.
