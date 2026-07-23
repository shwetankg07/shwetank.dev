// Synthesized terminal sounds — Web Audio, no assets, OFF by default.
// Only ever enabled by an explicit user click, so autoplay policy is satisfied.

let ctx: AudioContext | null = null;
let enabled = false;

export function initSoundFromStorage() {
  try {
    // On by default; a stored preference (from the toggle) always wins.
    // Browser autoplay policy still holds sound until the first user gesture.
    const stored = localStorage.getItem("reg-sfx");
    enabled = stored === null ? true : stored === "1";
  } catch {}
}

export function soundEnabled() {
  return enabled;
}

export function setSoundEnabled(v: boolean) {
  enabled = v;
  try {
    localStorage.setItem("reg-sfx", v ? "1" : "0");
  } catch {}
  if (v) ensure();
}

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function blip(freq: number, dur: number, gain: number, type: OscillatorType = "square") {
  if (!enabled) return;
  const c = ensure();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(gain, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  o.connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + dur);
}

export const sfx = {
  /** keystroke tick during typing animation */
  tick() {
    blip(1800 + Math.random() * 600, 0.012, 0.02);
  },
  /** enter key */
  enter() {
    blip(320, 0.05, 0.03, "triangle");
  },
  /** install complete — two rising notes */
  chime() {
    blip(523, 0.09, 0.04, "sine");
    setTimeout(() => blip(784, 0.14, 0.04, "sine"), 90);
  },
  /** something went wrong (or very right, in the case of rm -rf) */
  thud() {
    blip(110, 0.18, 0.05, "sawtooth");
  },
};
