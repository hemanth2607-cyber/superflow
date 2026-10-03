import * as Tone from 'tone'

class SoundEngine {
  private isInitialized = false
  private kotoSynth: Tone.PolySynth | null = null
  private taikoDrum: Tone.MembraneSynth | null = null
  private chimeSynth: Tone.MetalSynth | null = null
  private woodClick: Tone.NoiseSynth | null = null
  private ambientLoop: Tone.Loop | null = null

  // Japanese Insen & Hirajoshi pentatonic scales (C, Db, F, G, Bb / A, B, C, E, F)
  private pentatonicNotes = ['C4', 'Eb4', 'F4', 'G4', 'Bb4', 'C5', 'Eb5', 'F5']

  async init() {
    if (this.isInitialized) return
    try {
      await Tone.start()

      // 1. Koto / Guzheng Plucked String Synth
      this.kotoSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle8' },
        envelope: {
          attack: 0.005,
          decay: 0.6,
          sustain: 0.02,
          release: 0.8,
        },
      }).toDestination()
      this.kotoSynth.volume.value = -12

      // 2. Soft Taiko Drum
      this.taikoDrum = new Tone.MembraneSynth({
        pitchDecay: 0.06,
        octaves: 3,
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.002,
          decay: 0.8,
          sustain: 0.01,
          release: 1.2,
        },
      }).toDestination()
      this.taikoDrum.volume.value = -14

      // 3. Silk Chime
      this.chimeSynth = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.4, release: 0.6 },
        harmonicity: 5.1,
        modulationIndex: 16,
        resonance: 4000,
        octaves: 1.5,
      }).toDestination()
      this.chimeSynth.volume.value = -24

      // 4. Wooden puppet joint click
      this.woodClick = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.001, decay: 0.04, sustain: 0 },
      }).toDestination()
      this.woodClick.volume.value = -20

      // 5. Gentle ambient melody loop (slow tempo 48 bpm)
      let step = 0
      this.ambientLoop = new Tone.Loop((time) => {
        if (!this.kotoSynth) return
        const note = this.pentatonicNotes[step % this.pentatonicNotes.length]
        if (step % 2 === 0) {
          this.kotoSynth.triggerAttackRelease(note, '8n', time)
        }
        if (step % 8 === 0 && this.taikoDrum) {
          this.taikoDrum.triggerAttackRelease('A1', '4n', time)
        }
        step++
      }, '2n')

      this.isInitialized = true
    } catch (err) {
      console.warn('Tone.js audio context initialization error:', err)
    }
  }

  playPluck(note?: string) {
    if (!this.isInitialized || !this.kotoSynth) return
    const chosen = note || this.pentatonicNotes[Math.floor(Math.random() * this.pentatonicNotes.length)]
    this.kotoSynth.triggerAttackRelease(chosen, '8n')
  }

  playClick() {
    if (!this.isInitialized || !this.woodClick) return
    this.woodClick.triggerAttackRelease('16n')
  }

  playCelebration() {
    if (!this.isInitialized || !this.kotoSynth || !this.taikoDrum) return
    const chord = ['C4', 'G4', 'C5', 'Eb5']
    chord.forEach((n, idx) => {
      setTimeout(() => {
        this.kotoSynth?.triggerAttackRelease(n, '4n')
      }, idx * 120)
    })
    this.taikoDrum.triggerAttackRelease('C2', '2n')
  }

  startAmbient() {
    if (!this.isInitialized) return
    try {
      Tone.Transport.bpm.value = 52
      Tone.Transport.start()
      this.ambientLoop?.start(0)
    } catch {}
  }

  stopAmbient() {
    try {
      this.ambientLoop?.stop()
      Tone.Transport.stop()
    } catch {}
  }
}

export const soundEngine = new SoundEngine()
