import { app, BrowserWindow, Menu } from 'electron'
import createMenu from './menu'
import createRPC from './rpc'
import createBot from './bot.js'

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

  process.on('uncaughtException', (error) => {
    console.log(error)
    console.log(error.stack)
  })

  win.loadURL(`file://${__dirname}/app/app.html`)

  const rpc = createRPC(win)
  const bot = createBot(rpc)

  rpc.on('init', () => {
    win.show()
    win.focus()
  })

  win.on('closed', () => {
    console.log('closing')
    win = null
    bot.kill()
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
