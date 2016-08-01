import { app, BrowserWindow, Menu } from 'electron'
import createMenu from './main/menu'
import createRPC from './main/rpc'
import createBot from './main/bot/'

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
    width: 1024 * 0.75 + 10,
    height: 728 * 0.75,
    titleBarStyle: 'hidden'
  })

  win.loadURL(`file://${__dirname}/app/app.html`)

  const rpc = createRPC(win)

  const setupBot = () => {
    let {bot, fork} = createBot(rpc) // eslint-disable-line

    bot.on('close', () => {
      console.log('child closed, disconnecting rpc')
      rpc.emit('watcher error', {
        name: 'child closed',
        message: 'bot process exited for an unknown reason, please restart.'
      })
      fork.destroy()
      setupBot()
    })
  }

  setupBot()

  rpc.on('init', () => {
    win.show()
    win.focus()
  })

  process.on('uncaughtException', (error) => {
    rpc.emit('error', error)
  })

  win.on('closed', () => {
    win = null
    app.quit()
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
