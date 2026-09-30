/**
 * Procedural sound: every effect and the ambient score are synthesised with the
 * Web Audio API, so the game ships no audio files at all.
 */
import type { Theme } from '../game/types'

export type Sfx =
  | 'pluck'
  | 'place'
  | 'thing'
  | 'whisper'
  | 'scribble'
  | 'refuse'
  | 'jump'
  | 'land'
  | 'death'
  | 'page'
  | 'note'
  | 'checkpoint'
  | 'diary'
  | 'complete'
  | 'undo'
  | 'click'
  | 'dark'
  | 'letter'
  | 'shush'
  | 'bell'
  | 'water'
  | 'flip'
  | 'tick'
  | 'chime'

const SCALES: Record<Theme, number[]> = {
  // A minor pentatonic, gentle.
  woods: [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 659.25],
  river: [196, 246.94, 293.66, 329.63, 392, 493.88, 587.33],
  // Lower and sparser.
  night: [164.81, 196, 220, 246.94, 329.63, 392],
  blot: [110, 130.81, 146.83, 155.56, 196, 220],
  // D dorian: old, echoing rooms.
  library: [146.83, 174.61, 196, 220, 261.63, 293.66, 349.23, 392],
  archive: [138.59, 164.81, 185, 207.65, 246.94, 277.18],
  flood: [110, 123.47, 146.83, 164.81, 196, 220],
  // Whole-tone: time slipping.
  clock: [196, 220, 246.94, 277.18, 311.13, 349.23, 392],
}

export class Sound {
  private ctx: AudioContext | null = null
  private master!: GainNode
  private sfx!: GainNode
  private music!: GainNode
  private echo!: DelayNode
  private noise!: AudioBuffer
  private ambient: { stop: () => void; theme: Theme } | null = null
  private hum: { osc: OscillatorNode; gain: GainNode } | null = null
  private volume = 0.8
  private musicOn = true
  private muted = false

  get ready(): boolean {
    return !!this.ctx
  }

  /** Must be called from a user gesture. */
  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume()
      return
    }
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    this.ctx = ctx
    this.master = ctx.createGain()
    this.master.connect(ctx.destination)
    this.sfx = ctx.createGain()
    this.sfx.gain.value = 0.9
    this.sfx.connect(this.master)
    this.music = ctx.createGain()
    this.music.gain.value = this.musicOn ? 0.5 : 0
    this.music.connect(this.master)
    // A soft echo for the music box.
    this.echo = ctx.createDelay(1)
    this.echo.delayTime.value = 0.38
    const fb = ctx.createGain()
    fb.gain.value = 0.35
    const wet = ctx.createGain()
    wet.gain.value = 0.4
    this.echo.connect(fb).connect(this.echo)
    this.echo.connect(wet).connect(this.music)
    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = this.noise.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    this.applyVolume()
  }

  setVolume(v: number): void {
    this.volume = v
    this.applyVolume()
  }

  setMusic(on: boolean): void {
    this.musicOn = on
    if (this.ctx) this.music.gain.setTargetAtTime(on ? 0.5 : 0, this.ctx.currentTime, 0.3)
  }

  setMuted(m: boolean): void {
    this.muted = m
    this.applyVolume()
  }

  get isMuted(): boolean {
    return this.muted
  }

  private applyVolume(): void {
    if (this.ctx) this.master.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime, 0.05)
  }

  // ------------------------------------------------------------ primitives

  private tone(freq: number, dur: number, o: { type?: OscillatorType; gain?: number; to?: number; at?: number; dest?: AudioNode; attack?: number } = {}): void {
    const ctx = this.ctx
    if (!ctx) return
    const t0 = ctx.currentTime + (o.at ?? 0)
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = o.type ?? 'sine'
    osc.frequency.setValueAtTime(freq, t0)
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur)
    const peak = o.gain ?? 0.2
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(peak, t0 + (o.attack ?? 0.008))
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    osc.connect(g).connect(o.dest ?? this.sfx)
    osc.start(t0)
    osc.stop(t0 + dur + 0.05)
  }

  private hiss(dur: number, o: { freq?: number; q?: number; gain?: number; type?: BiquadFilterType; to?: number; at?: number } = {}): void {
    const ctx = this.ctx
    if (!ctx) return
    const t0 = ctx.currentTime + (o.at ?? 0)
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    const f = ctx.createBiquadFilter()
    f.type = o.type ?? 'bandpass'
    f.frequency.setValueAtTime(o.freq ?? 2000, t0)
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + dur)
    f.Q.value = o.q ?? 1.2
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(o.gain ?? 0.2, t0 + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    src.connect(f).connect(g).connect(this.sfx)
    src.start(t0, Math.random() * 0.5)
    src.stop(t0 + dur + 0.05)
  }

  play(name: Sfx): void {
    if (!this.ctx) return
    switch (name) {
      case 'pluck':
        this.hiss(0.09, { freq: 3200, q: 2, gain: 0.25 })
        this.tone(880, 0.18, { type: 'triangle', to: 440, gain: 0.12 })
        break
      case 'place':
        this.tone(320, 0.2, { to: 900, gain: 0.16 })
        this.tone(1200, 0.25, { at: 0.08, gain: 0.05 })
        break
      case 'thing':
        ;[659.25, 783.99, 987.77].forEach((f, i) => this.tone(f, 0.5, { at: i * 0.07, gain: 0.08 }))
        this.hiss(0.4, { freq: 6000, q: 0.7, gain: 0.03, at: 0.05 })
        break
      case 'whisper':
        this.tone(523.25, 0.6, { gain: 0.05, attack: 0.1 })
        this.hiss(0.6, { freq: 1500, q: 0.6, gain: 0.04, to: 5000 })
        break
      case 'scribble':
        this.tone(110, 0.3, { type: 'sawtooth', gain: 0.06, to: 70 })
        for (let i = 0; i < 4; i++) this.hiss(0.05, { freq: 900 + i * 600, q: 4, gain: 0.18, at: i * 0.05 })
        break
      case 'refuse':
        this.tone(196, 0.14, { type: 'triangle', gain: 0.1 })
        this.tone(185, 0.18, { type: 'triangle', gain: 0.08, at: 0.1 })
        break
      case 'jump':
        this.tone(260, 0.1, { to: 390, gain: 0.05 })
        break
      case 'land':
        this.hiss(0.06, { freq: 500, type: 'lowpass', gain: 0.15 })
        break
      case 'death':
        this.hiss(0.5, { freq: 1200, type: 'lowpass', gain: 0.35, to: 120 })
        this.tone(220, 0.5, { to: 55, gain: 0.15 })
        break
      case 'page':
        this.hiss(0.55, { freq: 1200, q: 0.8, gain: 0.18, to: 4200 })
        this.hiss(0.25, { freq: 3000, q: 0.8, gain: 0.08, at: 0.3 })
        break
      case 'note':
        for (let i = 0; i < 3; i++) this.hiss(0.05, { freq: 4000 + i * 700, q: 3, gain: 0.05, at: i * 0.06 })
        break
      case 'checkpoint':
        this.tone(784, 0.3, { gain: 0.07 })
        this.tone(1046.5, 0.45, { gain: 0.06, at: 0.1 })
        break
      case 'diary':
        ;[523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => this.tone(f, 0.9, { at: i * 0.09, gain: 0.06 }))
        break
      case 'complete':
        ;[392, 493.88, 587.33, 783.99].forEach((f, i) => this.tone(f, 1.4, { at: i * 0.11, gain: 0.08, attack: 0.02 }))
        break
      case 'undo':
        this.tone(700, 0.14, { to: 350, type: 'triangle', gain: 0.07 })
        break
      case 'click':
        this.hiss(0.03, { freq: 2500, q: 3, gain: 0.12 })
        break
      case 'dark':
        this.tone(130.81, 1.6, { gain: 0.1, to: 98, attack: 0.1 })
        break
      case 'letter':
        this.tone(987.77, 0.3, { gain: 0.07 })
        this.tone(1318.5, 0.5, { gain: 0.06, at: 0.07 })
        break
      case 'shush':
        this.hiss(1.4, { freq: 5200, q: 0.6, gain: 0.16, type: 'highpass' })
        break
      case 'bell':
        for (let i = 0; i < 3; i++) this.tone(1568, 0.6, { gain: 0.08, at: i * 0.28, type: 'triangle' })
        break
      case 'flip':
        this.tone(1200, 0.05, { type: 'square', gain: 0.03 })
        this.tone(900, 0.05, { type: 'square', gain: 0.03, at: 0.12 })
        this.hiss(0.5, { freq: 800, q: 0.7, gain: 0.14, to: 3000, at: 0.05 })
        this.tone(523.25, 0.7, { gain: 0.05, to: 261.63, at: 0.1 })
        break
      case 'tick':
        for (let i = 0; i < 4; i++) this.tone(i % 2 ? 900 : 1300, 0.04, { type: 'square', gain: 0.04, at: i * 0.3 })
        break
      case 'chime':
        ;[392, 493.88, 587.33].forEach((f) => this.tone(f, 2.2, { gain: 0.07, type: 'triangle', attack: 0.005 }))
        this.tone(98, 1.6, { gain: 0.1 })
        break
      case 'water':
        this.hiss(1.2, { freq: 400, q: 0.5, gain: 0.12, type: 'lowpass', to: 900 })
        break
    }
  }

  // ---------------------------------------------------------------- ambient

  startAmbient(theme: Theme): void {
    const ctx = this.ctx
    if (!ctx) return
    if (this.ambient?.theme === theme) return
    this.stopAmbient()
    const out = ctx.createGain()
    out.gain.value = 0.0001
    out.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 2.5)
    out.connect(this.music)
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    const tense = theme === 'blot' || theme === 'flood'
    filter.frequency.value = tense ? 380 : 700
    filter.connect(out)
    const root = SCALES[theme][0] / 2
    const oscs: OscillatorNode[] = []
    for (const [mult, detune] of [
      [1, -6],
      [1.5, 5],
      [2, 0],
    ]) {
      const o = ctx.createOscillator()
      o.type = tense ? 'sawtooth' : 'triangle'
      o.frequency.value = root * mult
      o.detune.value = detune
      const g = ctx.createGain()
      g.gain.value = tense ? 0.018 : 0.03
      o.connect(g).connect(filter)
      o.start()
      oscs.push(o)
    }
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.07
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 250
    lfo.connect(lfoGain).connect(filter.frequency)
    lfo.start()

    let alive = true
    let timer = 0
    const scale = SCALES[theme]
    const noteLoop = () => {
      if (!alive || !this.ctx) return
      const f = scale[Math.floor(Math.random() * scale.length)]
      const g = tense ? 0.05 : 0.07
      this.tone(f, 2.8, { gain: g, dest: this.echo, attack: 0.01 })
      this.tone(f, 2.8, { gain: g * 0.6, dest: this.music, attack: 0.01 })
      if (Math.random() < 0.3) this.tone(f * 1.5, 2.2, { gain: g * 0.4, dest: this.echo, at: 0.25 })
      const gap = theme === 'night' || theme === 'archive' ? 3.2 : tense ? 1.6 : 2.2
      timer = window.setTimeout(noteLoop, (gap + Math.random() * gap) * 1000)
    }
    timer = window.setTimeout(noteLoop, 1200)

    let beat = 0
    if (tense) {
      // A heartbeat.
      const pulse = () => {
        if (!alive) return
        this.tone(55, 0.25, { gain: 0.16, dest: this.music, to: 40 })
        this.tone(55, 0.2, { gain: 0.1, dest: this.music, to: 40, at: 0.22 })
        beat = window.setTimeout(pulse, theme === 'flood' ? 850 : 1100)
      }
      beat = window.setTimeout(pulse, 500)
    }

    this.ambient = {
      theme,
      stop: () => {
        alive = false
        clearTimeout(timer)
        clearTimeout(beat)
        const now = ctx.currentTime
        out.gain.cancelScheduledValues(now)
        out.gain.setValueAtTime(out.gain.value, now)
        out.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)
        for (const o of [...oscs, lfo]) o.stop(now + 1.3)
      },
    }
  }

  stopAmbient(): void {
    this.ambient?.stop()
    this.ambient = null
  }

  /** A low hum that grows as the Blot gets closer (0 = far, 1 = on top of you). */
  blotHum(closeness: number): void {
    const ctx = this.ctx
    if (!ctx) return
    if (!this.hum && closeness > 0) {
      const osc = ctx.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.value = 49
      const f = ctx.createBiquadFilter()
      f.type = 'lowpass'
      f.frequency.value = 160
      const gain = ctx.createGain()
      gain.gain.value = 0
      osc.connect(f).connect(gain).connect(this.sfx)
      osc.start()
      this.hum = { osc, gain }
    }
    if (this.hum) this.hum.gain.gain.setTargetAtTime(Math.max(0, Math.min(1, closeness)) * 0.22, ctx.currentTime, 0.2)
  }

  stopHum(): void {
    if (!this.hum || !this.ctx) return
    this.hum.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1)
    this.hum.osc.stop(this.ctx.currentTime + 0.5)
    this.hum = null
  }
}
