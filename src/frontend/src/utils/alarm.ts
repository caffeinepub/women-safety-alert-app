/**
 * SafeAlert - Alarm Sound Utility
 * Generates an oscillating alarm tone using Web Audio API.
 * Alternates between 880Hz and 1100Hz every 0.5 seconds.
 * Auto-stops after 10 seconds or when stopAlarm() is called.
 */

let audioContext: AudioContext | null = null;
let alarmOscillator: OscillatorNode | null = null;
let alarmGain: GainNode | null = null;
let alarmTimeout: ReturnType<typeof setTimeout> | null = null;
let isAlarmPlaying = false;

export function playAlarm(durationMs = 10000): void {
  if (isAlarmPlaying) return;
  isAlarmPlaying = true;

  try {
    audioContext = new AudioContext();
    const ctx = audioContext;

    alarmGain = ctx.createGain();
    alarmGain.gain.setValueAtTime(0.8, ctx.currentTime);
    alarmGain.connect(ctx.destination);

    const createBeep = (startTime: number, freq: number, dur: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, startTime);
      g.gain.setValueAtTime(0, startTime);
      g.gain.linearRampToValueAtTime(0.7, startTime + 0.02);
      g.gain.setValueAtTime(0.7, startTime + dur - 0.02);
      g.gain.linearRampToValueAtTime(0, startTime + dur);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + dur);
    };

    const totalBeeps = Math.floor(durationMs / 500);
    const now = ctx.currentTime;
    for (let i = 0; i < totalBeeps; i++) {
      const freq = i % 2 === 0 ? 1100 : 880;
      createBeep(now + i * 0.5, freq, 0.45);
    }

    alarmTimeout = setTimeout(() => {
      stopAlarm();
    }, durationMs);
  } catch (e) {
    console.warn("Web Audio API not available:", e);
    isAlarmPlaying = false;
  }
}

export function stopAlarm(): void {
  if (alarmTimeout) {
    clearTimeout(alarmTimeout);
    alarmTimeout = null;
  }

  if (alarmOscillator) {
    try {
      alarmOscillator.stop();
    } catch {}
    alarmOscillator = null;
  }

  if (alarmGain) {
    alarmGain = null;
  }

  if (audioContext) {
    try {
      void audioContext.close();
    } catch {}
    audioContext = null;
  }

  isAlarmPlaying = false;
}

export function isAlarmActive(): boolean {
  return isAlarmPlaying;
}
