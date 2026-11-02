import { useRef, type MouseEvent, type PointerEvent } from "react";

const MAX_ACTIVATION_MOVEMENT_PX = 10;

interface IPendingOption<T> {
  value: T;
  x: number;
  y: number;
  key: string;
  pointerId: number;
}

export const useOptionPointer = <T>(onSelect: (value: T) => void) => {
  const pending = useRef<IPendingOption<T> | null>(null);

  const handlePointerDown = (event: PointerEvent<HTMLElement>, key: string, value: T) => {
    if (!event.isPrimary || event.button !== 0) return;

    // Keep the focused combobox open until a tap or click is completed.
    event.preventDefault();
    pending.current = {
      key,
      value,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const option = pending.current;
    if (
      option?.pointerId === event.pointerId &&
      Math.hypot(event.clientX - option.x, event.clientY - option.y) > MAX_ACTIVATION_MOVEMENT_PX
    ) {
      pending.current = null;
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>, key: string) => {
    const option = pending.current;
    pending.current = null;
    if (option?.pointerId === event.pointerId && option.key === key) onSelect(option.value);
  };

  const handleClick = (event: MouseEvent<HTMLElement>, value: T) => {
    if (event.detail === 0) onSelect(value);
  };

  const handlePointerCancel = () => {
    pending.current = null;
  };

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleClick,
  };
};
