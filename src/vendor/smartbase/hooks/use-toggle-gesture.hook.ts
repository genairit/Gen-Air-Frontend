import { useHapticFeedback } from "./use-haptic-feedback.hook";
import { useRef, useState, type MouseEvent, type PointerEvent } from "react";

const DRAG_THRESHOLD_PX = 3;
const COMMIT_PROGRESS = 0.5;

const clampToUnitRange = (value: number): number => Math.min(Math.max(value, 0), 1);

export interface IToggleGestureOptions {
  travel: number;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}

export interface IToggleGestureProps {
  onClick: (event: MouseEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
}

export interface IToggleGesture {
  progress: number;
  isPressed: boolean;
  isDragging: boolean;
  gestureProps: IToggleGestureProps;
}

export const useToggleGesture = ({
  travel,
  checked,
  disabled,
  onChange,
}: IToggleGestureOptions): IToggleGesture => {
  const { vibrate } = useHapticFeedback();

  const startXRef = useRef<number>(0);
  const directionRef = useRef<number>(1);
  const isPointerDownRef = useRef<boolean>(false);
  const shouldSuppressClickRef = useRef<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragProgress, setDragProgress] = useState<number | null>(null);

  const restProgress = checked ? 1 : 0;

  const commitChange = (nextChecked: boolean): void => {
    vibrate();
    onChange(nextChecked);
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>): void => {
    if (disabled) {
      return;
    }

    const element = event.currentTarget;

    element.setPointerCapture(event.pointerId);
    startXRef.current = event.clientX;
    isPointerDownRef.current = true;
    directionRef.current = getComputedStyle(element).direction === "rtl" ? -1 : 1;
    setIsDragging(false);
    setDragProgress(restProgress);
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>): void => {
    if (!isPointerDownRef.current) {
      return;
    }

    const distance = (event.clientX - startXRef.current) * directionRef.current;

    setIsDragging(wasDragging => wasDragging || Math.abs(distance) > DRAG_THRESHOLD_PX);
    setDragProgress(clampToUnitRange(restProgress + distance / travel));
  };

  const handlePointerUp = (): void => {
    if (!isPointerDownRef.current) {
      return;
    }

    const draggedChecked = (dragProgress ?? restProgress) >= COMMIT_PROGRESS;

    isPointerDownRef.current = false;
    shouldSuppressClickRef.current = isDragging;
    setIsDragging(false);
    setDragProgress(null);

    if (!isDragging) {
      return;
    }

    if (draggedChecked === checked) {
      return;
    }

    commitChange(draggedChecked);
  };

  const handlePointerCancel = (): void => {
    isPointerDownRef.current = false;
    shouldSuppressClickRef.current = isDragging;
    setIsDragging(false);
    setDragProgress(null);
  };

  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    event.stopPropagation();

    const wasDragged = shouldSuppressClickRef.current;

    shouldSuppressClickRef.current = false;

    if (wasDragged) {
      return;
    }

    commitChange(!checked);
  };

  return {
    isDragging,
    isPressed: dragProgress !== null,
    progress: dragProgress ?? restProgress,
    gestureProps: {
      onClick: handleClick,
      onPointerUp: handlePointerUp,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerCancel: handlePointerCancel,
    },
  };
};
