// Custom haptic patterns

type Vibration = { duration: number; intensity?: number; delay?: number };

// Simple 1 -> 0.25
export const KEYPRESS: Vibration[] = [
  { duration: 14, intensity: 1 },
  { delay: 10, duration: 10, intensity: 0.25 },
];

// Mimics physical toggle switch
export const SWITCH: Vibration[] = [
  { duration: 18, intensity: 1 },
  { delay: 12, duration: 28, intensity: 0.35 },
];

// Three escalating pulses
export const BOOT: Vibration[] = [
  { duration: 25, intensity: 0.4 },
  { delay: 35, duration: 25, intensity: 0.7 },
  { delay: 35, duration: 40, intensity: 1 },
];

// Single soft pulse
export const PING: Vibration[] = [{ duration: 22, intensity: 0.5 }];

// Short tap then a longer hold
export const CONFIRM: Vibration[] = [
  { duration: 30, intensity: 0.75 },
  { delay: 45, duration: 65, intensity: 1 },
];

// Single crisp tick for on/off filter chips
export const TICK: Vibration[] = [{ duration: 16, intensity: 0.95 }];
