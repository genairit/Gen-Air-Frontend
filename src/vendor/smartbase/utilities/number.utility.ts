export interface IClampOptions {
  min: number;
  max: number;
  value: number;
}

export const clamp = ({ value, min, max }: IClampOptions): number =>
  Math.min(max, Math.max(min, value));
