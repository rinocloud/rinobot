import { app, BrowserWindow, Menu } from 'electron'
import createMenu from './menu'
import createRPC from './rpc'
import createBot from './bot/'
import AutoUpdater from './auto-updater'
const isDev = require('electron-is-dev')

const main = () => {
  if (require('electron-squirrel-startup')) return // eslint-disable-line
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
    })

    win.loadURL(`file://${__dirname}/app.html`)

    const rpc = createRPC(win)
    const setupBot = () => {
      let {bot, fork} = createBot(rpc) // eslint-disable-line

      bot.on('close', () => {
        rpc.emit('log', 'child closed, disconnecting rpc')
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

      if (!isDev && process.platform !== 'linux') {
        AutoUpdater(win, rpc)
      } else {
        rpc.emit('log', 'ignoring auto updates during dev')
      }
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
}
main()
