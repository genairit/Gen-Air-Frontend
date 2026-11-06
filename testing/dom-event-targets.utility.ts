export const installDomEventTargets = () => {
  const hadWindow = Reflect.has(globalThis, "window");
  const hadDocument = Reflect.has(globalThis, "document");
  const previousWindow = Reflect.get(globalThis, "window");
  const previousDocument = Reflect.get(globalThis, "document");

  const matchMedia = (media: string) => ({
    media,
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  });
  Reflect.set(
    globalThis,
    "window",
    Object.assign(new EventTarget(), { setTimeout, clearTimeout, matchMedia }),
  );
  Reflect.set(
    globalThis,
    "document",
    Object.assign(new EventTarget(), { documentElement: { scrollLeft: 0, scrollTop: 0 } }),
  );

  return () => {
    if (!hadWindow) {
      Reflect.deleteProperty(globalThis, "window");
    } else {
      Reflect.set(globalThis, "window", previousWindow);
    }

    if (!hadDocument) {
      Reflect.deleteProperty(globalThis, "document");
    } else {
      Reflect.set(globalThis, "document", previousDocument);
    }
  };
};
