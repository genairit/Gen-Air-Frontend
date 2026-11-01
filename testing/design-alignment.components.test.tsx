import { test } from "node:test";
import assert from "node:assert/strict";
import Icon from "../src/components/Icon/Icon";
import Tabs from "../src/components/Tabs/Tabs";
import { renderToStaticMarkup } from "react-dom/server";
import { theme } from "../src/constants/theme.constants";
import { ICON_NAMES } from "../src/constants/icon.constant";
import { TABS_VARIANTS } from "../src/constants/tabs.constant";

const tabs = [
  { id: "waiting", label: "ממתין", count: 0 },
  { id: "active", label: "בעבודה", dotColor: theme.palette.primary },
];
const noop = () => {};

test("every default icon resolves to an embedded decorative PNG from the design", () => {
  Object.values(ICON_NAMES).forEach(name => {
    const markup = renderToStaticMarkup(<Icon name={name} />);
    assert.match(markup, /<img[^>]+src="data:image\/png;base64,[A-Za-z0-9+/=]+"/);
    assert.match(markup, /aria-hidden="true"/);
    assert.match(markup, /alt=""/);
    assert.doesNotMatch(markup, /<svg/);
  });
});

test("custom icon tint preserves the vector fallback used by contrasting action buttons", () => {
  const markup = renderToStaticMarkup(
    <Icon size={32} color={theme.palette.white} name={ICON_NAMES.ADD} />,
  );
  assert.match(markup, /<svg/);
  assert.match(markup, /font-size:32px/);
  assert.doesNotMatch(markup, /<img/);
});

test("default segmented tabs preserve labels, zero counts and accessible selection", () => {
  const markup = renderToStaticMarkup(<Tabs items={tabs} activeId="waiting" onChange={noop} />);
  assert.match(markup, /role="tablist"/);
  assert.equal((markup.match(/role="tab"/g) ?? []).length, 2);
  assert.equal((markup.match(/aria-selected="true"/g) ?? []).length, 1);
  assert.match(markup, /ממתין/);
  assert.match(markup, /בעבודה/);
  assert.match(markup, /\(0\)/);
  assert.match(markup, /height:44px/);
});

test("compact status tabs render optional dots without changing the default segmented sizing", () => {
  const markup = renderToStaticMarkup(
    <Tabs items={tabs} activeId="active" onChange={noop} variant={TABS_VARIANTS.STATUS} />,
  );
  assert.match(markup, /min-height:36px/);
  assert.match(markup, /background-color:#1F7FDB/i);
  assert.equal((markup.match(/aria-selected="true"/g) ?? []).length, 1);
  assert.match(markup, /בעבודה/);
  assert.match(markup, /ממתין/);
});
