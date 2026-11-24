import type { KeyboardEvent } from "react";
import { RTL_ARROW_STEPS } from "../constants/keyboard.constant";

export class RadioChoiceNavigation {
  static handleKey = (event: KeyboardEvent<HTMLButtonElement>): void => {
    const step = Object.entries(RTL_ARROW_STEPS).find(([key]) => key === event.key)?.[1] ?? null;
    if (step === null) {
      return;
    }

    const group = event.currentTarget.closest('[role="radiogroup"]');
    const choices = Array.from(
      group?.querySelectorAll<HTMLButtonElement>('button[role="radio"]:not(:disabled)') ?? [],
    );
    const index = choices.indexOf(event.currentTarget);
    if (index < 0 || choices.length === 0) {
      return;
    }

    event.preventDefault();
    const next = choices[(index + step + choices.length) % choices.length];
    next.focus();
    next.click();
  };
}
