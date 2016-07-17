import { app, BrowserWindow, Menu } from 'electron'
import createMenu from './menu'
import createRPC from './rpc'
import createBot from './bot'

app.setName('rinobot')

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

if (process.platform === 'darwin') {
  app.dock.show()
}

app.on('ready', async () => {
  let win = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    titleBarStyle: 'hidden'
  })

  win.loadURL(`file://${__dirname}/app/app.html`)

  const rpc = createRPC(win)
  createBot(rpc)

  rpc.on('init', () => {
    win.show()
    win.focus()
  })

  win.on('closed', () => {
    win = null
  })

  win.webContents.on('context-menu', (e, props) => {
    Menu.buildFromTemplate([{
      label: 'Inspect element',
      click() { win.inspectElement(props.x, props.y) }
    }]).popup(win)
  })

  const template = createMenu(app, win)
  const menu = Menu.buildFromTemplate(template)
  win.setMenu(menu)
})
