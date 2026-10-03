import { create } from 'zustand'

export interface BuildFile {
  name: string
  path: string
  size: string
  code: string
  status: 'pending' | 'writing' | 'written'
}

export type BuildPhase = 'idle' | 'thinking' | 'gathering' | 'weaving' | 'pruning' | 'done'

interface BuildState {
  phase: BuildPhase
  label: string
  progress: number
  files: BuildFile[]
  activeFileIndex: number
  isLivePreviewReady: boolean
  startBuild: () => void
  resetBuild: () => void
  setActiveFileIndex: (idx: number) => void
}

const SAMPLE_PROJECT_FILES: BuildFile[] = [
  {
    name: 'index.html',
    path: 'index.html',
    size: '1.2 KB',
    status: 'pending',
    code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Spring Bloom Sanctuary</title>
    <link rel="stylesheet" href="./style.css" />
  </head>
  <body>
    <main class="sanctuary-stage">
      <header class="lantern-header">
        <h1>Hanami Haven</h1>
        <p>A tranquil sanctuary woven with silk threads and springtime petals.</p>
      </header>
      <div id="experience-canvas"></div>
    </main>
  </body>
</html>`,
  },
  {
    name: 'style.css',
    path: 'src/style.css',
    size: '2.4 KB',
    status: 'pending',
    code: `:root {
  --bg-washi: #fbf8f1;
  --vermilion: #d33828;
  --sakura: #ea7a99;
  --gold: #c89532;
  --ink: #231815;
}

body {
  margin: 0;
  background: var(--bg-washi);
  color: var(--ink);
  font-family: 'Bricolage Grotesque', sans-serif;
  overflow-x: hidden;
}

.lantern-header {
  text-align: center;
  padding: 4rem 1.5rem;
  border-bottom: 1px solid rgba(200, 149, 50, 0.25);
}`,
  },
  {
    name: 'garden.ts',
    path: 'src/garden.ts',
    size: '3.1 KB',
    status: 'pending',
    code: `export class SpringGarden {
  private petals: Array<{ x: number; y: number; speed: number }> = [];

  constructor(private container: HTMLElement) {
    this.seedPetals();
    this.animate();
  }

  private seedPetals() {
    for (let i = 0; i < 48; i++) {
      this.petals.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        speed: 0.8 + Math.random() * 1.5,
      });
    }
  }

  private animate = () => {
    // Gentle floating petal drift
    requestAnimationFrame(this.animate);
  };
}`,
  },
  {
    name: 'theatre.ts',
    path: 'src/theatre.ts',
    size: '1.8 KB',
    status: 'pending',
    code: `// Marionette thread controller
export function attachMarionetteStrings(stageElement: HTMLElement) {
  console.log("Silk strings tied with gold finials.");
  return {
    tension: 0.85,
    damping: 0.08,
    sway: (angle: number) => {
      stageElement.style.transform = \`rotate(\${angle}deg)\`;
    }
  };
}`,
  },
]

export const useBuildStore = create<BuildState>((set, get) => ({
  phase: 'idle',
  label: 'Ready to build',
  progress: 0,
  files: SAMPLE_PROJECT_FILES,
  activeFileIndex: 0,
  isLivePreviewReady: false,

  setActiveFileIndex: (idx: number) => set({ activeFileIndex: idx }),

  startBuild: () => {
    // Reset state before building
    set({
      phase: 'thinking',
      label: 'Thinking',
      progress: 5,
      isLivePreviewReady: false,
      activeFileIndex: 0,
      files: SAMPLE_PROJECT_FILES.map((f) => ({ ...f, status: 'pending' })),
    })

    // Phase 1: Thinking -> Gathering petals (after 1.2s)
    setTimeout(() => {
      set({
        phase: 'gathering',
        label: 'Gathering petals',
        progress: 28,
        files: get().files.map((f, i) => (i === 0 ? { ...f, status: 'writing' } : f)),
      })
    }, 1200)

    // Phase 2: Gathering petals -> Weaving threads (after 2.6s)
    setTimeout(() => {
      set({
        phase: 'weaving',
        label: 'Weaving threads',
        progress: 58,
        activeFileIndex: 1,
        files: get().files.map((f, i) =>
          i === 0 ? { ...f, status: 'written' } : i === 1 ? { ...f, status: 'writing' } : f
        ),
      })
    }, 2600)

    // Phase 3: Weaving threads -> Pruning branches (after 4.2s)
    setTimeout(() => {
      set({
        phase: 'pruning',
        label: 'Pruning branches',
        progress: 85,
        activeFileIndex: 2,
        files: get().files.map((f, i) =>
          i <= 1 ? { ...f, status: 'written' } : i === 2 ? { ...f, status: 'writing' } : f
        ),
      })
    }, 4200)

    // Phase 4: Pruning branches -> Done (after 5.8s)
    setTimeout(() => {
      set({
        phase: 'done',
        label: 'Done',
        progress: 100,
        activeFileIndex: 0,
        isLivePreviewReady: true,
        files: get().files.map((f) => ({ ...f, status: 'written' })),
      })
    }, 5800)
  },

  resetBuild: () => {
    set({
      phase: 'idle',
      label: 'Ready to build',
      progress: 0,
      isLivePreviewReady: false,
      files: SAMPLE_PROJECT_FILES.map((f) => ({ ...f, status: 'pending' })),
    })
  },
}))
