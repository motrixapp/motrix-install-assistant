import { release } from 'node:os'
import { join } from 'node:path'
import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { autoUpdater, CancellationToken } from 'electron-updater'
import { getAppCacheDir } from 'electron-updater/out/AppAdapter'
import type { ProgressInfo, UpdateDownloadedEvent, UpdateInfo } from 'electron-updater'
import logger from 'electron-log'
import open from 'open'

import { APP_NAME } from './constants'
import {
  applicationsDirectory,
  getDestinationPath,
  installApplicationUseZip
} from './utils'

// Set log level
logger.transports.file.level = 'debug'

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: ' ',
    width: 800,
    height: 600,
    minWidth: 400,
    minHeight: 600,
    maxWidth: 1024,
    maxHeight: 768,
    icon: join(process.env.PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
    win.loadURL(url)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  // win.webContents.on('will-navigate', (event, url) => { }) #344
}

(async ()=>{
  app.whenReady().then(createWindow)

  app.on('window-all-closed', () => {
    win = null
    if (process.platform !== 'darwin') app.quit()
  })

  app.on('second-instance', () => {
    if (win) {
      // Focus on the main window if the user tried to open another
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })

  app.on('activate', () => {
    const allWindows = BrowserWindow.getAllWindows()
    if (allWindows.length) {
      allWindows[0].focus()
    } else {
      createWindow()
    }
  })

  // New window example arg: new windows url
  ipcMain.handle('open-win', (_, arg) => {
    const childWindow = new BrowserWindow({
      webPreferences: {
        preload,
        nodeIntegration: true,
        contextIsolation: false,
      },
    })

    if (process.env.VITE_DEV_SERVER_URL) {
      childWindow.loadURL(`${url}#${arg}`)
    } else {
      childWindow.loadFile(indexHtml, { hash: arg })
    }
  })

  autoUpdater.autoDownload = false
  autoUpdater.forceDevUpdateConfig = process.env.NODE_ENV === 'development'
  autoUpdater.logger = logger

  let installFile = ''
  const cancellationToken = new CancellationToken()
  
  autoUpdater.on('checking-for-update', () => {
    logger.info('checking-for-update')
  })

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    logger.info('update-available===>', info)
    try {
      autoUpdater.downloadUpdate(cancellationToken)
    } catch (e) {
      logger.info('downloadUpdate===>', e.message)
    }
  })

  autoUpdater.on('download-progress', (event: ProgressInfo) => {
    logger.info('download-progress===>', event)
    win.webContents.send('download-progress', event)
  })

  autoUpdater.on('update-downloaded', (event: UpdateDownloadedEvent) => {
    const { downloadedFile } = event
    logger.info('update-downloaded===>', downloadedFile)
    installFile = downloadedFile
    win.webContents.send('update-downloaded', downloadedFile)
  })

  ipcMain.on('download-artifact', async (event) => {
    autoUpdater.checkForUpdates()
  })

  ipcMain.on('cancel-download', async () => {
    logger.info('cancel-download===>')
    if (installFile) {
      return
    }
    cancellationToken.cancel()
  })

  const handleInstallNow = async () => {
    if (!installFile) {
      return
    }

    if (process.platform === 'darwin') {
      try {
        await installApplicationUseZip('Motrix', installFile)
      } catch (e) {
        win.webContents.send('mia:exception', e.message)
      }
    } else if (process.platform === 'win32') {
      // Run the Setup.exe file
      await open(installFile, { wait: true })
    } else if (process.platform === 'linux') {
      // Show the AppImage file in the file manager
      shell.openPath(installFile)
    }

    win.webContents.send('install-finished')
  }

  ipcMain.on('install-now', handleInstallNow)

  ipcMain.on('open-caches-path', async () => {
    const dir = getAppCacheDir()
    const p = join(dir, app.getName(), 'pending')
    shell.openPath(p)
  })

  ipcMain.on('open-applications-path', async () => {
    shell.openPath(applicationsDirectory)
  })

  ipcMain.on('run-app', async () => {
    const appPath = getDestinationPath(APP_NAME)
    setTimeout(() => {
      app.exit(0)
    }, 3000)
    await open(appPath, { wait: true })
  })

})()
