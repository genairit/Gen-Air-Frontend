export interface IUseEventListenerOptions {
  type: string;
  isEnabled?: boolean;
  target: EventTarget | null;
  listener: (event: Event) => void;
}
