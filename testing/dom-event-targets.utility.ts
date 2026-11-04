export const installDomEventTargets = () => {
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
    if (previousWindow === undefined) {
      Reflect.deleteProperty(globalThis, "window");
    } else {
      Reflect.set(globalThis, "window", previousWindow);
    }

    if (previousDocument === undefined) {
      Reflect.deleteProperty(globalThis, "document");
    } else {
      Reflect.set(globalThis, "document", previousDocument);
    }
  };
};
