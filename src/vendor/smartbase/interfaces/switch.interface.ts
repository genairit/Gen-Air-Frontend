export interface ISwitchStyleOptions {
  checked: boolean;
  progress: number;
  isPressed: boolean;
  isDragging: boolean;
}

export interface ISwitchTrackStyleOptions extends ISwitchStyleOptions {
  disabled: boolean;
}
