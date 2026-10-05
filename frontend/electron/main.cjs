const { app, BrowserWindow, shell, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const os = require('os')
const { exec, spawn } = require('child_process')

let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 960,
    minHeight: 640,
    title: 'SuperFlow — Polyglot Engine & Marionette Theatre',
    backgroundColor: '#0d0c0b',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  })

  // Smooth appearance when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Open external links in default OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

// Native Desktop Dialog Handlers
ipcMain.handle('dialog:openDirectory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Select Project Workspace Folder',
  })
  return result.filePaths[0] || null
})

// Check installed system compilers
ipcMain.handle('code:checkCompilers', async () => {
  const commands = {
    python: 'python -V',
    javascript: 'node -v',
    typescript: 'node -v',
    c: 'gcc --version',
    cpp: 'g++ --version',
    rust: 'rustc --version',
    java: 'javac -version',
    go: 'go version',
    powershell: 'powershell -Command "$PSVersionTable.PSVersion.ToString()"',
  }

  const results = {}
  for (const [lang, cmd] of Object.entries(commands)) {
    try {
      const output = await new Promise((resolve) => {
        exec(cmd, { timeout: 3000 }, (err, stdout, stderr) => {
          if (err) resolve(null)
          else resolve((stdout || stderr || '').trim().split('\n')[0])
        })
      })
      results[lang] = output
    } catch {
      results[lang] = null
    }
  }
  return results
})

// Universal Polyglot Code Compiler & Execution Handler
ipcMain.handle('code:execute', async (_event, { language, code, stdin = '' }) => {
  const startTime = Date.now()
  const tempDir = path.join(os.tmpdir(), 'superflow_runner_' + Date.now())
  fs.mkdirSync(tempDir, { recursive: true })

  try {
    let sourceFileName = 'main'
    let compileCmd = null
    let runCmd = null
    let args = []

    switch (language.toLowerCase()) {
      case 'python':
      case 'python3':
      case 'py':
        sourceFileName = 'main.py'
        runCmd = 'python'
        args = ['-u', path.join(tempDir, sourceFileName)]
        break

      case 'javascript':
      case 'js':
      case 'node':
        sourceFileName = 'main.js'
        runCmd = 'node'
        args = [path.join(tempDir, sourceFileName)]
        break

      case 'typescript':
      case 'ts':
        sourceFileName = 'main.ts'
        runCmd = 'npx'
        args = ['-y', 'tsx', path.join(tempDir, sourceFileName)]
        break

      case 'c':
        sourceFileName = 'main.c'
        compileCmd = `gcc "${path.join(tempDir, sourceFileName)}" -o "${path.join(tempDir, 'main.exe')}"`
        runCmd = path.join(tempDir, 'main.exe')
        break

      case 'cpp':
      case 'c++':
        sourceFileName = 'main.cpp'
        compileCmd = `g++ -std=c++20 "${path.join(tempDir, sourceFileName)}" -o "${path.join(tempDir, 'main.exe')}"`
        runCmd = path.join(tempDir, 'main.exe')
        break

      case 'rust':
      case 'rs':
        sourceFileName = 'main.rs'
        compileCmd = `rustc "${path.join(tempDir, sourceFileName)}" -o "${path.join(tempDir, 'main.exe')}"`
        runCmd = path.join(tempDir, 'main.exe')
        break

      case 'java':
        // Java requires class name matching filename
        sourceFileName = 'Main.java'
        compileCmd = `javac "${path.join(tempDir, sourceFileName)}"`
        runCmd = 'java'
        args = ['-cp', tempDir, 'Main']
        break

      case 'go':
      case 'golang':
        sourceFileName = 'main.go'
        runCmd = 'go'
        args = ['run', path.join(tempDir, sourceFileName)]
        break

      case 'powershell':
      case 'ps1':
        sourceFileName = 'main.ps1'
        runCmd = 'powershell'
        args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(tempDir, sourceFileName)]
        break

      default:
        return {
          success: false,
          notInstalled: true,
          error: `Local compiler runner for ${language} not configured. Falling back to universal sandbox.`,
        }
    }

    const sourceFilePath = path.join(tempDir, sourceFileName)
    fs.writeFileSync(sourceFilePath, code, 'utf8')

    // 1. Compile step (if needed)
    if (compileCmd) {
      const compileResult = await new Promise((resolve) => {
        exec(compileCmd, { timeout: 15000, cwd: tempDir }, (err, stdout, stderr) => {
          if (err) {
            resolve({
              success: false,
              stdout,
              stderr: stderr || err.message,
              exitCode: err.code || 1,
            })
          } else {
            resolve({ success: true, stdout, stderr })
          }
        })
      })

      if (!compileResult.success) {
        const duration = Date.now() - startTime
        return {
          success: false,
          stage: 'compilation',
          stdout: compileResult.stdout || '',
          stderr: compileResult.stderr || 'Compilation failed',
          exitCode: compileResult.exitCode,
          duration,
        }
      }
    }

    // 2. Execution step with Stdin
    return await new Promise((resolve) => {
      let child
      if (args.length > 0) {
        child = spawn(runCmd, args, { cwd: tempDir })
      } else {
        child = spawn(runCmd, [], { cwd: tempDir })
      }

      let stdout = ''
      let stderr = ''

      child.stdout.on('data', (d) => {
        stdout += d.toString()
      })

      child.stderr.on('data', (d) => {
        stderr += d.toString()
      })

      if (stdin) {
        child.stdin.write(stdin)
        child.stdin.end()
      } else {
        child.stdin.end()
      }

      const timer = setTimeout(() => {
        child.kill()
        resolve({
          success: false,
          stdout,
          stderr: stderr + '\nExecution timed out (15s limit reached).',
          exitCode: 124,
          duration: Date.now() - startTime,
        })
      }, 15000)

      child.on('close', (code) => {
        clearTimeout(timer)
        resolve({
          success: code === 0,
          stage: 'execution',
          stdout,
          stderr,
          exitCode: code ?? 0,
          duration: Date.now() - startTime,
        })
      })

      child.on('error', (err) => {
        clearTimeout(timer)
        resolve({
          success: false,
          notInstalled: err.code === 'ENOENT',
          stdout,
          stderr: err.message,
          exitCode: 1,
          duration: Date.now() - startTime,
        })
      })
    })
  } catch (err) {
    return {
      success: false,
      error: err.message,
      duration: Date.now() - startTime,
    }
  } finally {
    // Cleanup temporary files after a short delay
    setTimeout(() => {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true })
      } catch {}
    }, 2000)
  }
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
