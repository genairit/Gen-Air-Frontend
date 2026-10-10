const INITIALS_FONT_RATIO = 0.3;

export const getInitialsFontSize = (avatarSize: number) =>
  Math.round(avatarSize * INITIALS_FONT_RATIO);
