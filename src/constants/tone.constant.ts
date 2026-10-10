export const AVATAR_TONES = {
  AIR: "air",
  CHARCOAL: "charcoal",
} as const;

export type AvatarToneType = (typeof AVATAR_TONES)[keyof typeof AVATAR_TONES];

export const SURFACE_TONES = {
  DARK: "dark",
  LIGHT: "light",
} as const;

export type SurfaceToneType = (typeof SURFACE_TONES)[keyof typeof SURFACE_TONES];
