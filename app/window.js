import createBot, { checkPythonVersion } from './bot/'
import { BrowserWindow } from 'electron'
import autoUpdater from './auto-updater'
import isDev from 'electron-is-dev'
import _package from './package'
import createMenu from './menu'
import createRPC from './rpc'

export default (app) => {
  let win = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
  })

  win.loadURL(`file://${__dirname}/app.html`)

  createMenu(app, win)
  const rpc = createRPC(win)
  const {bot, fork} = createBot(rpc) // eslint-disable-line

  bot.on('close', () => {
    rpc.emit('watcher error', {
      name: 'child closed',
      message: 'bot process exited for an unknown reason, please restart.'
    })
    fork.destroy()
  })

  process.on('uncaughtException', (error) => {
    rpc.emit('error', error)
  })

  rpc.on('init', () => {
    win.show()
    win.focus()

    rpc.emit('rinobot version', { version: _package.version })
    checkPythonVersion((version) => {
      rpc.emit('python version', { version })
    })

    if (!isDev && process.platform !== 'linux') {
      autoUpdater(win, rpc)
    } else {
      rpc.emit('log', 'ignoring auto updates during dev')
    }
  })

  win.on('closed', () => {
    win = null
    app.quit()
  })
}
