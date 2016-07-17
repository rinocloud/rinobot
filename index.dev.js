import { app, BrowserWindow, Menu } from 'electron'
import createMenu from './menu'

import * as mainProcessChokidar from './app/rinobot.js/src/watcher'
global.mainProcessChokidar = mainProcessChokidar

let mainWindow = null

app.setName('rinobot')
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

if (process.platform === 'darwin') {
  app.dock.show()
}

app.on('ready', async () => {
  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    titleBarStyle: 'hidden'
  })

  mainWindow.loadURL(`file://${__dirname}/app/app.html`)

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.on('context-menu', (e, props) => {
    Menu.buildFromTemplate([{
      label: 'Inspect element',
      click() { mainWindow.inspectElement(props.x, props.y) }
    }]).popup(mainWindow)
  })

  const template = createMenu(app, mainWindow)
  const menu = Menu.buildFromTemplate(template)
  mainWindow.setMenu(menu)
})
