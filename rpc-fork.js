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
}

export default function (_process) {
  return new IPC(_process)
}
