import { app, BrowserWindow } from 'electron'
import { createSentry } from './analytics'
import createBot from './bot/'
import checkPythonVersion from './bot/utils/checkPythonVersion'
import updateRinobotPlugin from './bot/utils/updateRinobotPlugin'
import autoUpdater from './auto-updater'
import isDev from 'electron-is-dev'
import _package from './package'
import createMenu from './menu'
import createRPC from './rpc'
import moment from 'moment'
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
      if (version) {
        updateRinobotPlugin((error) => {
          if (error) {
            rpc.emit('unexpected error', {
              datetime: moment().toISOString(),
              name: error.name,
              message: error.message,
              stack: error.stack,
              code: error.code || null,
              errno: error.errno || null,
              syscall: error.syscall || null,
              path: error.path || null,
            })
            sentry.captureException(new JSONError(error))
          }
        })
      }

      rpc.emit('python version', { version })
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
