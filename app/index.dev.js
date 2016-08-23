import { app, BrowserWindow } from 'electron'
import { createSentry } from './analytics'
import createBot, { checkPythonVersion } from './bot/'
import autoUpdater from './auto-updater'
import isDev from 'electron-is-dev'
import _package from './package'
import createMenu from './menu'
import createRPC from './rpc'
import npmi from 'npmi'

export const JSONError = error => {
  this.name = error.name
  this.message = (error.message || '')
  this.stack = error.stack
}

JSONError.prototype = Error.prototype;

const isOSX = process.platform === 'darwin'

const createWindow = (app, sentry) => { // eslint-disable-line
  let win = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
  })

  win.loadURL(`file://${__dirname}/app.html`)

  createMenu(app, win)
  const rpc = createRPC(win)
  const { child, forkRpc } = createBot()

  rpc.on('watch', args => forkRpc.emit('watch', args))
  rpc.on('unwatch', args => forkRpc.emit('unwatch', args))
  forkRpc.on('ready', () => rpc.emit('child process ready'))
  forkRpc.on('watcher ready', args => rpc.emit('watcher ready', args))
  forkRpc.on('watcher started', args => rpc.emit('watcher started', args))
  forkRpc.on('watcher set total files', args => rpc.emit('watcher set total files', args))
  forkRpc.on('watcher set processed files', args => rpc.emit('watcher set processed files', args))
  forkRpc.on('pipeline started', args => rpc.emit('pipeline started', args))
  forkRpc.on('pipeline complete', args => rpc.emit('pipeline complete', args))
  forkRpc.on('pipeline log', args => rpc.emit('pipeline log', args))
  forkRpc.on('task complete', args => rpc.emit('task complete', args))
  forkRpc.on('task started', args => rpc.emit('task started', args))

  forkRpc.on('pipeline error', error => {
    rpc.emit('pipeline error', error)
    console.log(`pipeline >>> ${JSON.stringify(error, null, 2)}`)
    sentry.captureException(new JSONError(error))
  })

  forkRpc.on('error', error => {
    rpc.emit('error', error)
    console.log(`forkRpc >>> ${JSON.stringify(error, null, 2)}`)
    sentry.captureException(new JSONError(error))
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

  win.on('close', () => {
    console.log('ev:close destroying child processes and rpcs')
    child.kill()
    forkRpc.destroy()
    rpc.destroy()
  })

  win.on('closed', () => {
    console.log('ev:quit')
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
