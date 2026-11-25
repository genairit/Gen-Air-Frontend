export interface IUseEventListenerOptions {
  type: string;
  capture?: boolean;
  isEnabled?: boolean;
  target: EventTarget | null;
  listener: (event: Event) => void;
}

export interface IEventListenerRegistration extends Pick<
  IUseEventListenerOptions,
  "type" | "listener"
> {
  target: EventTarget;
  options: AddEventListenerOptions;
}
