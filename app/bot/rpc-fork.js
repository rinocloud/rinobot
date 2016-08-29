/*
  This is the rpc between the main electron process and the rinobot
  watcher process
*/

import { EventEmitter } from 'events'
const type = 'ipc-event'

export class IPC {
  constructor(_process) {
    this.emitter = new EventEmitter()
    this.process = _process

    this.process.on('message', message => {
      this.emitter.emit(message.ch, message.data)
    })
  }

  emit(ch, data) {
    this.process.send({ type, ch, data })
  }

  on(ev, fn) {
    this.emitter.on(ev, fn)
  }

  once(ev, fn) {
    this.emitter.once(ev, fn)
  }

  removeAllListeners() {
    this.emitter.removeAllListeners()
  }

  destroy() {
    this.removeAllListeners()
    this.destroyed = true
  }

}

export default function (_process) {
  return new IPC(_process)
}


/*
import { EventEmitter } from 'events'
const type = 'ipc-event'

export class IPC {
  constructor(_process) {
    this.emitter = new EventEmitter()
    this.process = _process

    this.process.on('message', message => {
      this.emitter.emit(message.ch, message.data)
    })

    this.queue = []
    this.timer = null
    this.last = null
  }

  emit(ch, data) {
    const task = () => {
      if (this.queue.length === 0) return
      console.log('sending batch')
      this.process.send({ type, ch: 'batch', queue: this.queue })
      this.queue = []
    }

    const payload = { type, ch, data }

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

  removeAllListeners() {
    this.emitter.removeAllListeners()
  }

  destroy() {
    this.removeAllListeners()
    this.destroyed = true
  }

}

export default function (_process) {
  return new IPC(_process)
}
*/
