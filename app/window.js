import createBot, { checkPythonVersion } from './bot/'
import { BrowserWindow } from 'electron'
import autoUpdater from './auto-updater'
import isDev from 'electron-is-dev'
import _package from './package'
import createMenu from './menu'
import createRPC from './rpc'


function JSONError(error) {
  this.name = error.name
  this.message = (error.message || '')
  this.stack = error.stack
}

JSONError.prototype = Error.prototype;

export default (app, sentry) => {
  let win = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
  })

  win.loadURL(`file://${__dirname}/app.html`)

  createMenu(app, win)
  const rpc = createRPC(win)
  const {bot, fork} = createBot(rpc) // eslint-disable-line

  fork.on('error', error => {
    // this get called if there is an issue **in** the child process
    rpc.emit('error', error)
    sentry.captureException(new JSONError(error))
  })

  bot.on('error', error => {
    // this only gets called if there is an issue **creating**
    // the child process, not if there is an error **in** the
    // child process
    rpc.emit('error', error)
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
    bot.kill()
    fork.destroy()
    rpc.destroy()
  })

  win.on('closed', () => {
    console.log('ev:quit')
    win = null
    app.quit()
  })
}
