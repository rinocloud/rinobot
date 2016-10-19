import { app, BrowserWindow } from 'electron'
import { createSentry } from './analytics'
import createBot, { updateRinobotPlugin } from './bot/'
import { checkPythonVersion } from './bot/utils/'
import autoUpdater from './auto-updater'
import isDev from 'electron-is-dev'
import _package from './package'
import createMenu from './menu'
import createRPC from './rpc'
import rpcMap, { JSONError } from './rpcMap'

const isOSX = process.platform === 'darwin'

const createWindow = (app, sentry) => { // eslint-disable-line
  let win = new BrowserWindow({
    show: false,
    width: 1200,
    height: 800,
    titleBarStyle: 'hidden'
  })

  win.loadURL(`file://${__dirname}/app.html`)

  createMenu(app, win)
  const rpc = createRPC(win)
  const { child, forkRpc } = createBot()

  rpcMap(rpc, forkRpc, sentry)

  rpc.on('init', () => {
    win.show()
    win.focus()

    rpc.emit('rinobot version', { version: _package.version })
    checkPythonVersion((version) => {
      rpc.emit('python version', { version })
    })

    updateRinobotPlugin((error) => {
      if (error) {
        rpc.emit('unexpected error', error)
        sentry.captureException(new JSONError(error))
      }
    })

    if (!isDev && process.platform !== 'linux') {
      autoUpdater(win, rpc)
    }
  })

  win.on('close', () => {
    child.kill()
    forkRpc.destroy()
    rpc.destroy()
  })

  win.on('closed', () => {
    win = null
    app.quit()
  })
}

const main = () => {
  if (require('electron-squirrel-startup')) return // eslint-disable-line
  const sentry = createSentry()
  app.setName('rinobot')
  app.on('window-all-closed', () => { if (!isOSX) app.quit() })
  app.on('ready', () => { createWindow(app, sentry) })
  if (isOSX) app.dock.show()
}

main()
