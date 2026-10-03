import { create } from 'zustand'
import { ProjectType } from './useFlowStore'

export type PuppetMode = 'idle' | 'reacting' | 'building' | 'celebrating'

interface PuppetState {
  hoveredType: ProjectType | null
  mode: PuppetMode
  chineseGestureCounter: number
  japaneseGestureCounter: number
  controlBarTilt: { x: number; y: number }

  setHoveredType: (type: ProjectType | null) => void
  setMode: (mode: PuppetMode) => void
  triggerChineseGesture: () => void
  triggerJapaneseGesture: () => void
  setControlBarTilt: (tilt: { x: number; y: number }) => void
}

export const usePuppetStore = create<PuppetState>((set) => ({
  hoveredType: null,
  mode: 'idle',
  chineseGestureCounter: 0,
  japaneseGestureCounter: 0,
  controlBarTilt: { x: 0, y: 0 },

  setHoveredType: (hoveredType) =>
    set({
      hoveredType,
      mode: hoveredType ? 'reacting' : 'idle',
    }),
  setMode: (mode) => set({ mode }),
  triggerChineseGesture: () =>
    set((state) => ({ chineseGestureCounter: state.chineseGestureCounter + 1 })),
  triggerJapaneseGesture: () =>
    set((state) => ({ japaneseGestureCounter: state.japaneseGestureCounter + 1 })),
  setControlBarTilt: (controlBarTilt) => set({ controlBarTilt }),
}))
