import { app, BrowserWindow } from 'electron'
import { createSentry } from './analytics'
import createBot, { checkPythonVersion } from './bot/'
import autoUpdater from './auto-updater'
import isDev from 'electron-is-dev'
import _package from './package'
import createMenu from './menu'
import createRPC from './rpc'

export const JSONError = function (error) {
  this.name = error.name || ''
  this.message = error.message || ''
  this.stack = error.stack || ''
  if (error.code) this.code = error.code
  if (error.errno) this.errno = error.errno || ''
  if (error.syscall) this.syscall = error.syscall || ''
  if (error.path) this.path = error.path || ''
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
  rpc.on('unwatch all', args => forkRpc.emit('unwatch all', args))

  forkRpc.on('ready', () => rpc.emit('child process ready'))

  forkRpc.on('watcher ready', args => rpc.emit('watcher ready', args))
  forkRpc.on('watcher started', args => rpc.emit('watcher started', args))
  forkRpc.on('watcher set total files', args => rpc.emit('watcher set total files', args))
  forkRpc.on('watcher set processed files', args => rpc.emit('watcher set processed files', args))

  forkRpc.on('set history', args => rpc.emit('set history', args))
  forkRpc.on('task started', args => rpc.emit('task started', args))
  forkRpc.on('task log', args => rpc.emit('task log', args))
  forkRpc.on('task complete', args => rpc.emit('task complete', args))
  forkRpc.on('task error', args => {
    sentry.captureException(new JSONError(args.error))
    rpc.emit('task error', args)
  })
  forkRpc.on('task ignore', args => rpc.emit('task ignore', args))

  forkRpc.on('unexpected error', error => {
    rpc.emit('unexpected error', error)
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
