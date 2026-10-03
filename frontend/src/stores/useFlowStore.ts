import { create } from 'zustand'

export type FlowStage = 'overture' | 'casting' | 'workshop' | 'premiere'

export type ProjectType =
  | 'website'
  | 'webapp'
  | 'mobile'
  | 'desktop'
  | 'game'
  | 'dashboard'
  | 'api'
  | 'other'

export type ProjectFeel = 'sakura' | 'camellia' | 'bamboo' | 'wisteria'

export interface FlowState {
  stage: FlowStage
  actionType: 'open' | 'new' | 'clone'
  projectType: ProjectType
  projectFeel: ProjectFeel
  projectName: string
  projectDescription: string
  folderPath: string

  setStage: (stage: FlowStage) => void
  setActionType: (action: 'open' | 'new' | 'clone') => void
  setProjectType: (type: ProjectType) => void
  setProjectFeel: (feel: ProjectFeel) => void
  setProjectName: (name: string) => void
  setProjectDescription: (desc: string) => void
  setFolderPath: (path: string) => void
  resetFlow: () => void
}

export const useFlowStore = create<FlowState>((set) => ({
  stage: 'overture',
  actionType: 'new',
  projectType: 'website',
  projectFeel: 'sakura',
  projectName: 'hanami-haven',
  projectDescription: 'A delicate sanctuary celebrating the seasonal bloom of cherry blossoms.',
  folderPath: '~/projects/hanami-haven',

  setStage: (stage) => set({ stage }),
  setActionType: (actionType) => set({ actionType }),
  setProjectType: (projectType) => set({ projectType }),
  setProjectFeel: (projectFeel) => set({ projectFeel }),
  setProjectName: (projectName) => set({ projectName }),
  setProjectDescription: (projectDescription) => set({ projectDescription }),
  setFolderPath: (folderPath) => set({ folderPath }),
  resetFlow: () =>
    set({
      stage: 'overture',
      actionType: 'new',
      projectType: 'website',
      projectFeel: 'sakura',
    }),
}))
