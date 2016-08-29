/*
  This is the rpc between the main electron process and the renderer process
*/

const { EventEmitter } = require('events')
const { ipcMain } = require('electron')
const genUid = require('uid2')

class Server {
  constructor(win) {
    this.win = win
    this.cache = {}
    this.ipcListener = this.ipcListener.bind(this)
    this.emitter = new EventEmitter()

    genUid(10, (err, uid) => {
      if (this.destroyed) return
      if (err) return this.emitter.emit('error', err)

      this.id = uid
      ipcMain.on(uid, this.ipcListener)
      // we intentionally subscribe to `on` instead of `once`
      // to support reloading the window and re-initializing
      // the channel
      this.wc.on('did-finish-load', () => {
        this.wc.send('init', uid)
      })
    })

    this.queue = []
    this.timer = null
    this.last = null
  }

  get wc() {
    return this.win.webContents
  }

  ipcListener(event, { ev, data }) {
    this.emitter.emit(ev, data)
  }

  emit(ch, data) {
    const payload = { ch, data }
    const task = () => {
      if (this.queue.length === 0) return
      this.wc.send(this.id, { ch: 'batch', data: this.queue })
      this.queue = []
    }

    if (this.timer) {
      clearTimeout(this.timer)
    }

    this.queue.push(payload)
    const now = new Date().getTime()
    if (this.last && now < this.last + 500) {
      this.timer = setTimeout(task, 500)
    } else {
      this.last = now
      task()
    }
  }

  on(ev, fn) {
    this.emitter.on(ev, fn)
  }

  once(ev, fn) {
    this.emitter.once(ev, fn)
  }

  removeListener(ev, fn) {
    this.emitter.removeListener(ev, fn)
  }

  removeAllListeners() {
    this.emitter.removeAllListeners()
  }

  destroy() {
    this.destroyed = true
    this.removeAllListeners()
    this.wc.removeAllListeners()
    if (this.id) {
      ipcMain.removeListener(this.id, this.ipcListener)
    }
  }

}

module.exports = function createRPC(win) {
  return new Server(win)
}
