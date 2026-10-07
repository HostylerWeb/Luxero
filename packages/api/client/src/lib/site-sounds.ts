type SoundName = "add" | "remove" | "error" | "win";

let ctx: AudioContext | undefined;
let master: GainNode | undefined;
let reverb: ConvolverNode | undefined;
let noiseBuf: AudioBuffer | undefined;
let volume = 0.8;
let muted = false;
let pending: SoundName | null = null;

try {
  muted = localStorage.getItem("siteSoundsMuted") === "1";
  const stored = Number.parseFloat(localStorage.getItem("siteSoundsVol") ?? "");
  if (!Number.isNaN(stored)) volume = stored;
} catch {}

const midiToFreq = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
const N = {
  C5: 72,
  D5: 74,
  E5: 76,
  G5: 79,
  A5: 81,
  B5: 83,
  C6: 84,
  D6: 86,
  E6: 88,
  G6: 91,
  C7: 96,
};

function init() {
  if (ctx) return;
  const AudioCtx =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  ctx = new AudioCtx();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : volume;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.ratio.value = 4;
  master.connect(comp);
  comp.connect(ctx.destination);
  const len = ctx.sampleRate * 1.4;
  const ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = ir.getChannelData(channel);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.6;
    }
  }
  reverb = ctx.createConvolver();
  reverb.buffer = ir;
  const wet = ctx.createGain();
  wet.gain.value = 0.18;
  reverb.connect(wet);
  wet.connect(master);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const noiseData = noiseBuf.getChannelData(0);
  for (let i = 0; i < noiseData.length; i++) noiseData[i] = Math.random() * 2 - 1;
}

function tone(o: {
  t: number;
  f: number;
  dur: number;
  type?: OscillatorType;
  vol?: number;
  a?: number;
  r?: number;
  rev?: number;
  slide?: number;
  cutoff?: number;
  detune?: number | number[];
}) {
  if (!ctx || !master || !reverb) return;
  const t = o.t;
  const dur = o.dur;
  const attack = o.a ?? 0.005;
  const release = o.r ?? 0.1;
  const vol = o.vol ?? 0.2;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(vol, t + attack);
  gain.gain.setValueAtTime(vol, t + Math.max(attack, dur - release));
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let input: AudioNode = gain;
  if (o.cutoff) {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = o.cutoff;
    filter.connect(gain);
    input = filter;
  }
  gain.connect(master);
  if (o.rev) {
    const send = ctx.createGain();
    send.gain.value = o.rev;
    gain.connect(send);
    send.connect(reverb);
  }
  const detunes = Array.isArray(o.detune) ? o.detune : [o.detune ?? 0];
  for (const cents of detunes) {
    const osc = ctx.createOscillator();
    osc.type = o.type ?? "sine";
    osc.frequency.setValueAtTime(o.f, t);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t + dur);
    osc.detune.value = cents;
    osc.connect(input);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }
}

function noise(o: {
  t: number;
  dur: number;
  f: number;
  to?: number;
  q?: number;
  vol: number;
  type?: BiquadFilterType;
}) {
  if (!ctx || !master || !noiseBuf) return;
  const source = ctx.createBufferSource();
  source.buffer = noiseBuf;
  const filter = ctx.createBiquadFilter();
  filter.type = o.type ?? "bandpass";
  filter.Q.value = o.q ?? 1;
  filter.frequency.setValueAtTime(o.f, o.t);
  if (o.to) filter.frequency.exponentialRampToValueAtTime(o.to, o.t + o.dur);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, o.t);
  gain.gain.linearRampToValueAtTime(o.vol, o.t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, o.t + o.dur);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  source.start(o.t, 0, o.dur + 0.02);
}

const sounds: Record<SoundName, (t: number) => void> = {
  add(t) {
    tone({ t, f: midiToFreq(N.G5), dur: 0.16, type: "triangle", vol: 0.26, r: 0.1, rev: 0.4 });
    tone({ t: t + 0.09, f: midiToFreq(N.C6), dur: 0.42, type: "triangle", vol: 0.3, r: 0.3, rev: 0.6 });
    tone({ t: t + 0.09, f: midiToFreq(N.C6) * 2, dur: 0.3, type: "sine", vol: 0.07, r: 0.25, rev: 0.6 });
    tone({ t: t + 0.16, f: midiToFreq(N.E6), dur: 0.3, type: "sine", vol: 0.06, r: 0.25, rev: 0.7 });
  },
  remove(t) {
    tone({
      t,
      f: midiToFreq(N.C6),
      slide: midiToFreq(N.G5 - 5),
      dur: 0.2,
      type: "triangle",
      vol: 0.26,
      r: 0.12,
      rev: 0.25,
    });
    tone({
      t: t + 0.07,
      f: midiToFreq(N.E5),
      slide: midiToFreq(N.E5 - 7),
      dur: 0.2,
      type: "sine",
      vol: 0.12,
      r: 0.12,
    });
    noise({ t, dur: 0.22, f: 5200, to: 700, q: 0.8, vol: 0.09 });
  },
  error(t) {
    for (const [dt, f] of [
      [0, 220],
      [0.18, 207.65],
    ] as const) {
      tone({
        t: t + dt,
        f,
        dur: 0.17,
        type: "sawtooth",
        detune: [-14, 14],
        vol: 0.2,
        a: 0.006,
        r: 0.05,
        cutoff: 900,
      });
    }
    tone({ t, f: 110, dur: 0.38, type: "square", vol: 0.07, r: 0.15, cutoff: 400 });
  },
  win(t) {
    [N.C5, N.E5, N.G5, N.C6, N.E6, N.G6].forEach((note, i) => {
      const at = t + i * 0.075;
      tone({ t: at, f: midiToFreq(note), dur: 0.28, type: "triangle", vol: 0.2, r: 0.2, rev: 0.5 });
      tone({ t: at, f: midiToFreq(note) * 2, dur: 0.18, type: "sine", vol: 0.04, r: 0.15, rev: 0.5 });
    });
    const chord = t + 0.5;
    [N.C5 - 12, N.C5, N.E5, N.G5, N.C6, N.E6].forEach((note, i) => {
      tone({
        t: chord,
        f: midiToFreq(note),
        dur: 1.5,
        type: i === 0 ? "sine" : "triangle",
        detune: [-6, 6],
        vol: i === 0 ? 0.2 : 0.11,
        a: 0.01,
        r: 1.1,
        rev: 0.7,
      });
    });
    tone({ t: chord, f: midiToFreq(N.C7), dur: 1.2, type: "sine", vol: 0.07, r: 1, rev: 0.9 });
    noise({ t: chord - 0.02, dur: 0.5, f: 3000, to: 9000, q: 0.6, vol: 0.06, type: "highpass" });
    const pent = [N.C6, N.D6, N.E6, N.G6, N.C7, N.A5, N.B5];
    for (let i = 0; i < 14; i++) {
      tone({
        t: chord + 0.15 + i * 0.1 + Math.random() * 0.05,
        f: midiToFreq(pent[(Math.random() * pent.length) | 0] ?? N.C6),
        dur: 0.35,
        type: "sine",
        vol: 0.05 + Math.random() * 0.03,
        a: 0.002,
        r: 0.3,
        rev: 0.9,
      });
    }
  },
};

function run(name: SoundName) {
  if (!ctx || muted) return;
  sounds[name](ctx.currentTime + 0.02);
}

function queue(name: SoundName) {
  pending = name;
  const go = () => {
    for (const eventName of ["pointerdown", "keydown", "touchstart"] as const) {
      removeEventListener(eventName, go, true);
    }
    void ctx?.resume().then(() => {
      if (!pending) return;
      const next = pending;
      pending = null;
      run(next);
    });
  };
  for (const eventName of ["pointerdown", "keydown", "touchstart"] as const) {
    addEventListener(eventName, go, true);
  }
}

export function playSiteSound(name: SoundName) {
  if (typeof window === "undefined") return;
  init();
  if (!ctx) return;
  if (ctx.state === "running") {
    run(name);
    return;
  }
  void ctx
    .resume()
    .then(() => {
      if (ctx?.state === "running") run(name);
      else queue(name);
    })
    .catch(() => queue(name));
}

if (typeof window !== "undefined") {
  const unlock = () => {
    init();
    void ctx?.resume();
  };
  for (const eventName of ["pointerdown", "keydown", "touchstart"] as const) {
    window.addEventListener(eventName, unlock, { capture: true });
  }
}
