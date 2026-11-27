/**
 * Zero-dependency Web Audio API Procedural Sound Synthesizer (SoundFXEngine)
 * Designed specifically for iPad Safari multi-touch toddler apps:
 * - Auto-unlocks singleton AudioContext on first pointerdown/touchstart (with silent 1-sample buffer)
 * - Auto-resumes after iOS Safari background/lock suspension
 * - Routes all SFX through a DynamicsCompressorNode + voice-ducking GainNode (zero clipping!)
 * - Parameterized real-time mathematical synthesis (no external MP3s, zero network latency)
 */

const PENTATONIC_MAJOR_HZ = [
  523.25, // C5
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.0,  // A5
  1046.5, // C6
  1174.66, // D6
  1318.51, // E6
];

class SoundFXEngineImpl {
  private ctx: AudioContext | null = null;
  private sfxInput: GainNode | null = null;
  private duckGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;

  private whiteNoiseBuffer: AudioBuffer | null = null;
  private pinkNoiseBuffer: AudioBuffer | null = null;

  private sfxEnabled = true;
  private unlocked = false;
  private htmlAudioPrimed = false;
  private listenersBound = false;
  private lastChimeMs = 0;
  private duckRestoreTimer: number | null = null;
  private unlockCallbacks: Array<() => void> = [];

  constructor() {
    this.configureIOSSession();
    this.bindLifecycleListeners();
  }

  /** Register an extra synchronous unlock hook (e.g. speechSynthesis primer) to run inside first user gesture */
  onFirstUserGesture(cb: () => void) {
    this.unlockCallbacks.push(cb);
  }

  /**
   * iOS 17+ Safari AudioSession API:
   * Sets type = 'playback' so Web Audio & Darija speech remain audible even when the iPad's
   * Silent/Mute bell toggle is enabled in Control Center!
   */
  private configureIOSSession() {
    if (typeof navigator === 'undefined') return;
    try {
      const nav = navigator as Navigator & { audioSession?: { type: string } };
      if (nav.audioSession && nav.audioSession.type !== 'playback') {
        nav.audioSession.type = 'playback';
      }
    } catch {
      // Ignore on browsers without navigator.audioSession
    }
  }

  /**
   * Older iPadOS fallback for Silent Mode:
   * Playing a tiny 0.05s silent inline WAV through <audio playsinline> switches WebKit's
   * hardware audio session from 'ambient' (muted by Silent switch) to 'playback'!
   */
  private primeSilentHtmlAudio() {
    if (this.htmlAudioPrimed || typeof document === 'undefined') return;
    try {
      // Minimal valid 1-sample silent PCM WAV data URI (44-byte header + 2-byte silent sample)
      const silentWav =
        'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      const el = document.createElement('audio');
      el.setAttribute('playsinline', '');
      el.setAttribute('webkit-playsinline', '');
      el.preload = 'auto';
      el.src = silentWav;
      const p = el.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          this.htmlAudioPrimed = true;
        }).catch(() => {
          // Will retry on next user gesture
        });
      } else {
        this.htmlAudioPrimed = true;
      }
    } catch {
      // ignore
    }
  }

  /** Bind capturing global unlock & iOS visibility/interruption recovery listeners */
  private bindLifecycleListeners() {
    if (this.listenersBound || typeof window === 'undefined') return;
    this.listenersBound = true;

    const unlockHandler = () => {
      this.unlock();
      if (this.unlockCallbacks.length > 0) {
        for (const cb of this.unlockCallbacks) {
          try {
            cb();
          } catch {
            // ignore
          }
        }
      }
    };

    // Capture phase guarantees stopPropagation() on child buttons never blocks audio unlock!
    // Include touchend & click because iPadOS Safari strictly trusts touchend/click for WebAudio + Speech!
    window.addEventListener('touchstart', unlockHandler, { capture: true, passive: true });
    window.addEventListener('touchend', unlockHandler, { capture: true, passive: true });
    window.addEventListener('pointerdown', unlockHandler, { capture: true, passive: true });
    window.addEventListener('pointerup', unlockHandler, { capture: true, passive: true });
    window.addEventListener('click', unlockHandler, { capture: true, passive: true });
    window.addEventListener('keydown', unlockHandler, { capture: true, passive: true });

    const resumeIfNeeded = () => {
      this.configureIOSSession();
      if (this.ctx && this.ctx.state !== 'running' && this.ctx.state !== 'closed') {
        this.ctx.resume().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') resumeIfNeeded();
    });
    window.addEventListener('focus', resumeIfNeeded);
    window.addEventListener('pageshow', resumeIfNeeded);
  }

  /** Lazily initialize singleton AudioContext + DynamicsCompressor master bus */
  getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;

      this.configureIOSSession();
      const ctx = new AudioCtx();
      this.ctx = ctx;
      this.unlocked = ctx.state === 'running';

      // Track Apple WebKit's 'interrupted' & 'suspended' transitions so we always re-unlock cleanly!
      ctx.onstatechange = () => {
        this.unlocked = ctx.state === 'running';
      };

      // Audio graph: sfxInput -> duckGain -> DynamicsCompressor -> masterGain -> destination
      const sfxInput = ctx.createGain();
      sfxInput.gain.value = 1.0;

      const duckGain = ctx.createGain();
      duckGain.gain.value = 1.0;

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-14, ctx.currentTime);
      compressor.knee.setValueAtTime(18, ctx.currentTime);
      compressor.ratio.setValueAtTime(8, ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, ctx.currentTime);
      compressor.release.setValueAtTime(0.12, ctx.currentTime);

      const masterGain = ctx.createGain();
      masterGain.gain.value = this.sfxEnabled ? 0.9 : 0.0001;

      sfxInput.connect(duckGain);
      duckGain.connect(compressor);
      compressor.connect(masterGain);
      masterGain.connect(ctx.destination);

      this.sfxInput = sfxInput;
      this.duckGain = duckGain;
      this.compressor = compressor;
      this.masterGain = masterGain;

      this.buildNoiseBuffers(ctx);
    }

    // Resume BOTH 'suspended' AND iPadOS WebKit's 'interrupted' state!
    if (this.ctx.state !== 'running') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /** iOS Safari unlock: configure playback session, resume suspended/interrupted context, and prime buffer */
  unlock() {
    this.configureIOSSession();
    this.primeSilentHtmlAudio();

    const ctx = this.getContext();
    if (!ctx) return;

    if (ctx.state !== 'running') {
      ctx.resume()
        .then(() => {
          this.unlocked = ctx.state === 'running';
        })
        .catch(() => {});
    }

    if (!this.unlocked) {
      try {
        const silent = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = silent;
        src.connect(ctx.destination);
        src.start(0);
        if (ctx.state === 'running') {
          this.unlocked = true;
        }
      } catch {
        // Retry automatically on next user gesture
      }
    }
  }

  getDiagnostics() {
    const nav =
      typeof navigator !== 'undefined'
        ? (navigator as Navigator & { audioSession?: { type: string } })
        : null;
    return {
      state: this.ctx ? this.ctx.state : 'uninitialized',
      sampleRate: this.ctx ? this.ctx.sampleRate : 0,
      unlocked: this.unlocked,
      sfxEnabled: this.sfxEnabled,
      audioSessionType: nav?.audioSession?.type ?? 'unsupported',
    };
  }

  /** Toggle SFX mute independently of Darija voice pronunciations */
  setEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(enabled ? 0.9 : 0.0001, now, 0.02);
    }
  }

  isEnabled(): boolean {
    return this.sfxEnabled;
  }

  /**
   * Smoothly duck procedural SFX while Darija voice pronunciations play
   * so pops & boings never mask spoken words!
   */
  duckForSpeech(active: boolean, autoRestoreMs = 1800) {
    if (!this.ctx || !this.duckGain) return;
    const now = this.ctx.currentTime;
    this.duckGain.gain.cancelScheduledValues(now);

    if (this.duckRestoreTimer !== null) {
      window.clearTimeout(this.duckRestoreTimer);
      this.duckRestoreTimer = null;
    }

    if (active) {
      this.duckGain.gain.setTargetAtTime(0.35, now, 0.025);
      this.duckRestoreTimer = window.setTimeout(() => {
        this.duckForSpeech(false);
      }, autoRestoreMs);
    } else {
      this.duckGain.gain.setTargetAtTime(1.0, now, 0.08);
    }
  }

  /** Pre-build reusable 1s White Noise & Pink Noise buffers (zero per-tap allocation) */
  private buildNoiseBuffers(ctx: AudioContext) {
    const length = ctx.sampleRate; // 1 second

    // 1. White noise buffer
    const white = ctx.createBuffer(1, length, ctx.sampleRate);
    const wData = white.getChannelData(0);
    for (let i = 0; i < length; i++) {
      wData[i] = Math.random() * 2 - 1;
    }
    this.whiteNoiseBuffer = white;

    // 2. Pink noise buffer (Paul Kellet's crisp 6-pole pink filter)
    const pink = ctx.createBuffer(1, length, ctx.sampleRate);
    const pData = pink.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
      const wn = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + wn * 0.0555179;
      b1 = 0.99332 * b1 + wn * 0.0750759;
      b2 = 0.96900 * b2 + wn * 0.1538520;
      b3 = 0.86650 * b3 + wn * 0.3104856;
      b4 = 0.55000 * b4 + wn * 0.5329522;
      b5 = -0.7616 * b5 - wn * 0.0168980;
      pData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + wn * 0.5362) * 0.11;
      b6 = wn * 0.115926;
    }
    this.pinkNoiseBuffer = pink;
  }

  /** Connect a node to the compressed SFX bus with optional stereo pan (-1..1) */
  private connectToBus(ctx: AudioContext, source: AudioNode, panX = 0) {
    if (!this.sfxInput) return;
    if (typeof ctx.createStereoPanner === 'function' && Math.abs(panX) > 0.02) {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-0.85, Math.min(0.85, panX)), ctx.currentTime);
      source.connect(panner);
      panner.connect(this.sfxInput);
    } else {
      source.connect(this.sfxInput);
    }
  }

  /** Organic ±8% random pitch jitter so rapid toddler tapping feels musical, never robotic */
  private jitterPitch(range = 0.08): number {
    return 1 + (Math.random() * 2 - 1) * range;
  }

  // =========================================================================
  // 1. TACTILE BUBBLE POP — Inverse pitch-to-size scaling + ±8% jitter + 15ms HPF noise
  // =========================================================================
  playBubblePop(scale = 1.0, panX = 0) {
    if (!this.sfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxInput) return;

    const now = ctx.currentTime;
    // Bigger 3D bubbles = deeper, rounder pop; smaller bubbles = brighter, higher pop (+ ±8% organic jitter)
    const pitchScale =
      Math.max(0.65, Math.min(1.55, 1.0 / Math.max(0.55, scale))) * this.jitterPitch(0.08);
    const startHz = 600 * pitchScale;
    const endHz = 140 * pitchScale;

    // Layer A: Sine + Triangle pitch-drop body (45ms)
    const osc = ctx.createOscillator();
    const tri = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = 'sine';
    tri.type = 'triangle';
    osc.frequency.setValueAtTime(startHz, now);
    osc.frequency.exponentialRampToValueAtTime(endHz, now + 0.045);
    tri.frequency.setValueAtTime(startHz * 1.48, now);
    tri.frequency.exponentialRampToValueAtTime(endHz * 1.2, now + 0.045);

    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(0.24, now + 0.004);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

    osc.connect(env);
    tri.connect(env);
    this.connectToBus(ctx, env, panX);

    osc.start(now);
    tri.start(now);
    osc.stop(now + 0.06);
    tri.stop(now + 0.06);

    // Layer B: Crisp 15ms high-pass filtered white noise film-snap transient
    if (this.whiteNoiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.whiteNoiseBuffer;
      const hpf = ctx.createBiquadFilter();
      hpf.type = 'highpass';
      hpf.frequency.setValueAtTime(2400 * pitchScale, now);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.16, now);
      nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

      noise.connect(hpf);
      hpf.connect(nGain);
      this.connectToBus(ctx, nGain, panX);

      noise.start(now, Math.random() * 0.5, 0.02);
    }
  }

  // =========================================================================
  // 2. ELASTIC SPRING BOING — FM-modulated sine (14Hz LFO) + rising/settling pitch
  // =========================================================================
  playSpringBoing(velocity = 1.0, panX = 0) {
    if (!this.sfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxInput) return;

    const now = ctx.currentTime;
    const v = Math.max(0.6, Math.min(1.6, velocity));
    const jitter = this.jitterPitch(0.08);

    const carrier = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const amp = ctx.createGain();

    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(180 * (0.9 + v * 0.1) * jitter, now);
    carrier.frequency.exponentialRampToValueAtTime(420 * (0.92 + v * 0.08) * jitter, now + 0.09);
    carrier.frequency.exponentialRampToValueAtTime(260 * jitter, now + 0.28);

    // 14Hz LFO with exponentially decaying FM depth
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(14, now);
    lfoGain.gain.setValueAtTime(75 * v, now);
    lfoGain.gain.exponentialRampToValueAtTime(3, now + 0.28);

    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.linearRampToValueAtTime(0.18, now + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    lfo.connect(lfoGain);
    lfoGain.connect(carrier.frequency);
    carrier.connect(amp);
    this.connectToBus(ctx, amp, panX);

    carrier.start(now);
    lfo.start(now);
    carrier.stop(now + 0.32);
    lfo.stop(now + 0.32);
  }

  // =========================================================================
  // 3. MAGICAL SPARKLE / STAR CHIME — Pentatonic dual-detuned bell cascade + stereo pan
  // =========================================================================
  playSparkleCascade(comboIndex = 0, panX = 0) {
    if (!this.sfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxInput) return;

    const now = ctx.currentTime;
    const startIdx = Math.max(0, Math.min(2, comboIndex % 3));
    const notes = PENTATONIC_MAJOR_HZ.slice(startIdx, startIdx + 4);

    notes.forEach((freq, i) => {
      const t = now + i * 0.068;
      const oscA = ctx.createOscillator();
      const oscB = ctx.createOscillator();
      const bell = ctx.createOscillator();
      const env = ctx.createGain();

      // Dual detuned sine + airy bell overtone
      oscA.type = 'sine';
      oscB.type = 'sine';
      bell.type = 'triangle';
      oscA.frequency.setValueAtTime(freq, t);
      oscB.frequency.setValueAtTime(freq * 1.0045, t); // warm shimmer detune
      bell.frequency.setValueAtTime(freq * 2.002, t);  // sparkling bell partial

      const bellGain = ctx.createGain();
      bellGain.gain.setValueAtTime(0.22, t);
      bellGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      env.gain.setValueAtTime(0.0001, t);
      env.gain.linearRampToValueAtTime(0.12, t + 0.01);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.42); // 400ms release tail

      oscA.connect(env);
      oscB.connect(env);
      bell.connect(bellGain);
      bellGain.connect(env);

      // Gentle stereo spread centered around the 3D star's screen X-coordinate
      const notePan = Math.max(-0.85, Math.min(0.85, panX + (i - 1.5) * 0.12));
      this.connectToBus(ctx, env, notePan);

      oscA.start(t);
      oscB.start(t);
      bell.start(t);
      oscA.stop(t + 0.45);
      oscB.stop(t + 0.45);
      bell.stop(t + 0.45);
    });
  }

  // =========================================================================
  // 4. CARD FLIP & CAMERA WHOOSH — Bandpass-filtered pink noise (300Hz <-> 1200Hz, 120ms)
  // =========================================================================
  playWhoosh(direction: -1 | 1 = 1) {
    if (!this.sfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxInput || !this.pinkNoiseBuffer) return;

    const now = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = this.pinkNoiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(2.2, now);
    const fStart = direction > 0 ? 300 : 1200;
    const fEnd = direction > 0 ? 1200 : 300;
    filter.frequency.setValueAtTime(fStart, now);
    filter.frequency.exponentialRampToValueAtTime(fEnd, now + 0.12);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(0.22, now + 0.035);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    noise.connect(filter);
    filter.connect(env);

    if (typeof ctx.createStereoPanner === 'function') {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(-direction * 0.35, now);
      panner.pan.linearRampToValueAtTime(direction * 0.35, now + 0.12);
      env.connect(panner);
      panner.connect(this.sfxInput);
    } else {
      env.connect(this.sfxInput);
    }

    noise.start(now, Math.random() * 0.4, 0.16);
  }

  // =========================================================================
  // 5. GENTLE ERROR / NUDGE — Warm marimba/woodblock double-tap (G4 -> D4)
  // =========================================================================
  playSoftWoodblock(panX = 0) {
    if (!this.sfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxInput) return;

    const now = ctx.currentTime;
    const notes = [392.0, 293.66]; // G4 -> D4

    notes.forEach((freq, idx) => {
      const t = now + idx * 0.095;
      const osc = ctx.createOscillator();
      const lpf = ctx.createBiquadFilter();
      const env = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.96, t + 0.075);

      lpf.type = 'lowpass';
      lpf.frequency.setValueAtTime(1350, t);

      env.gain.setValueAtTime(0.0001, t);
      env.gain.linearRampToValueAtTime(0.16, t + 0.006);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);

      osc.connect(lpf);
      lpf.connect(env);
      this.connectToBus(ctx, env, panX);

      osc.start(t);
      osc.stop(t + 0.1);
    });
  }

  // =========================================================================
  // 6. SUBTLE DRAG TRAIL WIND-CHIME GRAIN — Rate-limited, speed-proportional
  // =========================================================================
  playWindChimeGrain(speed = 1.0, panX = 0) {
    if (!this.sfxEnabled) return;
    const nowMs = performance.now();
    if (nowMs - this.lastChimeMs < 82) return;
    this.lastChimeMs = nowMs;

    const ctx = this.getContext();
    if (!ctx || !this.sfxInput) return;

    const now = ctx.currentTime;
    const clampedSpeed = Math.max(0.2, Math.min(2.0, speed));
    const idx = Math.floor(Math.random() * PENTATONIC_MAJOR_HZ.length);
    const freq = PENTATONIC_MAJOR_HZ[idx] * (clampedSpeed > 1.2 ? 2 : 1);

    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const peak = Math.min(0.032, 0.012 + clampedSpeed * 0.01);
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(peak, now + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(env);
    this.connectToBus(ctx, env, panX);

    osc.start(now);
    osc.stop(now + 0.24);
  }

  // =========================================================================
  // 7. SOFT UI CLICK & LEVEL-COMPLETE CELEBRATION FANFARE
  // =========================================================================
  playClick(panX = 0) {
    if (!this.sfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxInput) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(640, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.045);

    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(0.09, now + 0.006);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

    osc.connect(env);
    this.connectToBus(ctx, env, panX);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  playFanfare() {
    if (!this.sfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxInput) return;

    const now = ctx.currentTime;
    const melody = [
      { f: 523.25, t: 0, d: 0.14, pan: -0.35 },
      { f: 659.25, t: 0.09, d: 0.14, pan: -0.15 },
      { f: 783.99, t: 0.18, d: 0.14, pan: 0.15 },
      { f: 1046.5, t: 0.28, d: 0.42, pan: 0.35 },
      { f: 1318.51, t: 0.42, d: 0.52, pan: 0.0 },
    ];

    for (const n of melody) {
      const start = now + n.t;
      const osc = ctx.createOscillator();
      const over = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'triangle';
      over.type = 'sine';
      osc.frequency.setValueAtTime(n.f, start);
      over.frequency.setValueAtTime(n.f * 2.002, start);

      const overGain = ctx.createGain();
      overGain.gain.setValueAtTime(0.25, start);

      env.gain.setValueAtTime(0.0001, start);
      env.gain.linearRampToValueAtTime(0.14, start + 0.015);
      env.gain.exponentialRampToValueAtTime(0.0001, start + n.d);

      osc.connect(env);
      over.connect(overGain);
      overGain.connect(env);
      this.connectToBus(ctx, env, n.pan);

      osc.start(start);
      over.start(start);
      osc.stop(start + n.d + 0.03);
      over.stop(start + n.d + 0.03);
    }
  }

  // =========================================================================
  // 8. BACKGROUND DELIGHT — Fountain Water Splash & Palm Frond Rustle
  // =========================================================================
  playWaterSplash(panX = 0) {
    if (!this.sfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxInput) return;

    const now = ctx.currentTime;
    const jitter = this.jitterPitch(0.08);

    // Layer A: Soft splash hiss (bandpass-filtered white noise sweep)
    if (this.whiteNoiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.whiteNoiseBuffer;
      const bpf = ctx.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.Q.setValueAtTime(1.8, now);
      bpf.frequency.setValueAtTime(1800 * jitter, now);
      bpf.frequency.exponentialRampToValueAtTime(650 * jitter, now + 0.22);

      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.0001, now);
      nGain.gain.linearRampToValueAtTime(0.14, now + 0.02);
      nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      noise.connect(bpf);
      bpf.connect(nGain);
      this.connectToBus(ctx, nGain, panX);
      noise.start(now, Math.random() * 0.4, 0.28);
    }

    // Layer B: Bubbly water-droplet chimes (pentatonic rising blips)
    const drops = [659.25, 880.0, 1046.5, 1318.51];
    drops.forEach((hz, i) => {
      const t = now + i * 0.055;
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(hz * 0.85 * jitter, t);
      osc.frequency.exponentialRampToValueAtTime(hz * 1.18 * jitter, t + 0.09);

      env.gain.setValueAtTime(0.0001, t);
      env.gain.linearRampToValueAtTime(0.09, t + 0.01);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

      osc.connect(env);
      this.connectToBus(ctx, env, panX + (i - 1.5) * 0.1);
      osc.start(t);
      osc.stop(t + 0.24);
    });
  }

  playPalmRustle(panX = 0) {
    if (!this.sfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxInput) return;

    const now = ctx.currentTime;
    const jitter = this.jitterPitch(0.08);

    // Layer A: Soft swaying palm-frond rustle (bandpass pink noise)
    if (this.pinkNoiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.pinkNoiseBuffer;
      const bpf = ctx.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.Q.setValueAtTime(1.4, now);
      bpf.frequency.setValueAtTime(1100 * jitter, now);
      bpf.frequency.exponentialRampToValueAtTime(2100 * jitter, now + 0.11);
      bpf.frequency.exponentialRampToValueAtTime(750 * jitter, now + 0.28);

      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.0001, now);
      nGain.gain.linearRampToValueAtTime(0.2, now + 0.04);
      nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

      noise.connect(bpf);
      bpf.connect(nGain);
      this.connectToBus(ctx, nGain, panX);
      noise.start(now, Math.random() * 0.4, 0.32);
    }

    // Layer B: Playful hollow coconut double "tok-tok"
    [330, 278].forEach((hz, idx) => {
      const t = now + 0.06 + idx * 0.11;
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(hz * jitter, t);
      osc.frequency.exponentialRampToValueAtTime(hz * 0.82 * jitter, t + 0.06);

      env.gain.setValueAtTime(0.0001, t);
      env.gain.linearRampToValueAtTime(0.13, t + 0.005);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.075);

      osc.connect(env);
      this.connectToBus(ctx, env, panX);
      osc.start(t);
      osc.stop(t + 0.085);
    });
  }
}

export const SoundFXEngine = new SoundFXEngineImpl();
