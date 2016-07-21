import { fork } from 'child_process'
import ipcCreator from 'ipc-event-emitter'


const bot = (rpc) => {
  const child = fork('./fork.js')
  const ipc = ipcCreator(child)

  ipc.on('ready', () => {
    console.log('ipc ready')
  })

  if (rpc) {
    rpc.on('watch', (args) => {
      ipc.emit('watch', args)
    })
    rpc.on('unwatch', (args) => {
      ipc.emit('unwatch', args)
    })

    ipc.on('watcher ready', (args) => {
      rpc.emit('watcher ready', args)
    })

    ipc.on('watcher started', (args) => {
      rpc.emit('watcher started', args)
    })

    ipc.on('watcher set total files', (args) => {
      rpc.emit('watcher set total files', args)
    })

    ipc.on('watcher set processed files', (args) => {
      rpc.emit('watcher set processed files', args)
    })

    ipc.on('pipeline started', (args) => {
      rpc.emit('pipeline started', args)
    })

    ipc.on('pipeline complete', (args) => {
      rpc.emit('pipeline complete', args)
    })

    ipc.on('pipeline error', (args) => {
      rpc.emit('pipeline error', args)
    })

    ipc.on('pipeline log', (args) => {
      rpc.emit('pipeline log', args)
    })
  }

  ipc.emit('start')
  return ipc
}

export default bot
