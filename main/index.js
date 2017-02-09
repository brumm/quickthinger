import { app, BrowserWindow, Menu, screen, globalShortcut } from 'electron'
import windowStateKeeper from 'electron-window-state'
import irpc from 'electron-irpc'

import template from './menu-template'
import getDirectoryContent from './getDirectoryContent'
import getIconForFile from './getIconForFile'
import getRecentDocumentsForApplication from './getRecentDocumentsForApplication'

const { protocol } = require('electron')

app.on('ready', () => {
  protocol.registerBufferProtocol('icon', ({ url }, callback) => {
    console.log('getting icon for', url);
    getIconForFile(url.slice(6), (err, icon) => {
      callback({
        mimeType: 'image/png',
        data: Buffer.from(icon, 'base64')
      })
    })
  })
})

const irpcMain = irpc.main()

irpcMain.addFunction('getDirectoryContent', getDirectoryContent)
irpcMain.addFunction('getIconForFile', getIconForFile)
irpcMain.addFunction('getRecentDocumentsForApplication', getRecentDocumentsForApplication)

const { DEV, PORT = '8080' } = process.env
const windowUrl = DEV
  ? `http://0.0.0.0:${PORT}/`
  : 'file://' + __dirname + '/index.html'

let mainWindow

function createWindow () {
  let { width, height } = screen.getPrimaryDisplay().workAreaSize
  let mainWindowState = windowStateKeeper({
    defaultWidth: 340,
    defaultHeight: 335
  });

  mainWindow = new BrowserWindow({
    width: mainWindowState.width,
    height: mainWindowState.height,
    x: mainWindowState.x,
    y: mainWindowState.y,
    resizable: false,
    frame: false,
    show: false,
    webPreferences: {
      webSecurity: false
    }
  })

  if (!globalShortcut.register('Control+Space', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
    }
  })) {
    console.log('shortcut registration failed')
  }

  mainWindowState.manage(mainWindow)
  mainWindow.loadURL(windowUrl)

  if (DEV) {
    mainWindow.webContents.openDevTools({ mode: 'undocked' })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.once('ready-to-show', mainWindow.show)
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

process.on('uncaughtException', ::console.log)
