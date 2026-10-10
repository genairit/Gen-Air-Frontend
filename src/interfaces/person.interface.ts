import type { AvatarToneType } from "../constants/tone.constant";

export interface IPerson {
  name: string;
  caption: string;
  initials: string;
  avatarTone?: AvatarToneType;
}
