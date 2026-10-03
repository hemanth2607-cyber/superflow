import { create } from 'zustand'
import { soundEngine } from '../audio/soundEngine'

interface AudioState {
  isMuted: boolean
  hasStarted: boolean
  toggleAudio: () => Promise<void>
  playPluck: (note?: string) => void
  playClick: () => void
  playCelebration: () => void
}

export const useAudioStore = create<AudioState>((set, get) => ({
  isMuted: true, // Strictly OFF by default
  hasStarted: false,

  toggleAudio: async () => {
    const nextMuted = !get().isMuted
    if (!nextMuted) {
      await soundEngine.init()
      soundEngine.startAmbient()
      soundEngine.playPluck('G4')
      set({ isMuted: false, hasStarted: true })
    } else {
      soundEngine.stopAmbient()
      set({ isMuted: true })
    }
  },

  playPluck: (note?: string) => {
    if (get().isMuted) return
    soundEngine.playPluck(note)
  },

  playClick: () => {
    if (get().isMuted) return
    soundEngine.playClick()
  },

  playCelebration: () => {
    if (get().isMuted) return
    soundEngine.playCelebration()
  },
}))
