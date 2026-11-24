import type { IEventListenerRegistration } from "../interfaces/event-listener.interface";

export const registerEventListener = ({
  type,
  target,
  listener,
  options,
}: IEventListenerRegistration): void => {
  target.addEventListener(type, listener, options);
};
