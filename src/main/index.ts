'use strict'

import { app, BrowserWindow, Menu } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
import { selectFolder } from '../helper'

const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: BrowserWindow | null

const createMainWindow = () => {
  const window = new BrowserWindow({ webPreferences: { nodeIntegration: true }, icon: __dirname + '/favicon.ico' })

  if (isDevelopment) {
    window.webContents.openDevTools()
  }

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
  } else {
    window.loadURL(formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    }))
  }

  window.on('closed', () => {
    mainWindow = null
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})


// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow()
  const menuTemplate: any = [
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Selecionar pasta',
          click: async () => {
            const files = await selectFolder.select(true)
            if (mainWindow) {
              mainWindow.webContents.send('select-folder-file', { 'data': files });
            }
          }
        },
        {
          type: 'separator'
        },
        {
          role: 'minimize'
        },
        {
          role: 'togglefullscreen'
        },
        {
          type: 'separator'
        },
        {
          role: 'close'
        }
      ]
    }
  ]
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
})