import { Box } from "@mui/material";
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { createRef, type ReactElement } from "react";
import GenericPopup from "../src/components/GenericPopup/GenericPopup";
import { act, create, type ReactTestInstance } from "react-test-renderer";

interface IFocusTargetProps {
  "data-focus-target"?: string;
}
interface IFocusNode {
  isConnected: boolean;
  closest: () => object;
  focus: HTMLElement["focus"];
  ownerDocument: { activeElement: object };
}

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

const FOCUS_SCENARIOS = {
  CONNECTED: { open: true, connected: true, optedIn: true, titleTarget: false, expected: 1 },
  DISCONNECTED: { open: true, connected: false, optedIn: true, titleTarget: false, expected: 0 },
  DEFAULT: { open: true, connected: true, optedIn: false, titleTarget: false, expected: 0 },
  TITLE: { open: true, connected: true, optedIn: true, titleTarget: true, expected: 1 },
  CHILD_FOCUSED: { open: true, connected: true, optedIn: true, titleTarget: true, expected: 0 },
  CLOSED: { open: false, connected: true, optedIn: true, titleTarget: false, expected: 0 },
} as const;

for (const [name, scenario] of Object.entries(FOCUS_SCENARIOS)) {
  test(`popup transition focuses only its opted-in connected target after entry: ${name}`, async (): Promise<void> => {
    const target = createRef<HTMLElement>();
    const focus = mock.fn<HTMLElement["focus"]>();
    const userControl = { tagName: "BUTTON" };
    const popup = { contains: (node: object): boolean => node === popup || node === userControl };
    const ownerDocument: IFocusNode["ownerDocument"] = { activeElement: popup };
    const renderer = { current: null as ReturnType<typeof create> | null };
    const initialFocusRef = scenario.optedIn ? target : null;
    const titleRef = scenario.titleTarget ? target : null;
    const contentRef = scenario.titleTarget ? null : target;
    try {
      await act(async (): Promise<void> => {
        renderer.current = create(
          <GenericPopup
            titleRef={titleRef}
            open={scenario.open}
            title="focus target"
            initialFocusRef={initialFocusRef ?? null}
            content={<Box ref={contentRef} data-focus-target="true" />}
            buttons={{ primary: { text: "Confirm", onClick: (): void => {} } }}
          />,
          {
            createNodeMock: (element: ReactElement<IFocusTargetProps>): IFocusNode | null => {
              const isContentTarget = element.props["data-focus-target"] === "true";
              const isTitleTarget = element.type === "h2";
              if (isContentTarget || isTitleTarget) {
                return {
                  isConnected: scenario.connected,
                  focus,
                  ownerDocument,
                  closest: () => popup,
                };
              }
              return null;
            },
          },
        );
      });
      assert.ok(renderer.current);
      const dialog = renderer.current.root.find(
        (node: ReactTestInstance): boolean => node.props["aria-label"] === "focus target",
      );
      assert.equal(focus.mock.callCount(), 0);
      await act(async (): Promise<void> => {
        if (name === "CHILD_FOCUSED") {
          ownerDocument.activeElement = userControl;
        }
        dialog.props.slotProps.transition.onEntered();
      });
      assert.equal(focus.mock.callCount(), scenario.expected);
      if (scenario.expected > 0) {
        assert.deepEqual(focus.mock.calls[0].arguments, [{ preventScroll: true }]);
      }
    } finally {
      await act(async (): Promise<void> => {
        renderer.current?.unmount();
      });
    }
  });
}
