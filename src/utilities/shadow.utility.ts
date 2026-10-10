interface ISoftShadowOptions {
  blur: number;
  offset: number;
  darkColor: string;
  lightColor: string;
}

const buildShadowPair = (options: ISoftShadowOptions, prefix: string) => {
  const { offset, blur, darkColor, lightColor } = options;

  const darkShadow = `${prefix}${offset}px ${offset}px ${blur}px ${darkColor}`;
  const lightShadow = `${prefix}-${offset}px -${offset}px ${blur}px ${lightColor}`;

  return `${darkShadow}, ${lightShadow}`;
};

export const createRaisedShadow = (options: ISoftShadowOptions) => buildShadowPair(options, "");

export const createInsetShadow = (options: ISoftShadowOptions) =>
  buildShadowPair(options, "inset ");

export const createFocusRing = (color: string) => `0 0 0 2px ${color}`;
