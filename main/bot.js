import { fork } from 'child_process'
import forkRpcCreator from './rpc-fork'
import pt from 'path'
const Bot = (rpc) => {
  const child = fork(pt.join(__dirname, 'fork.js'))
  const forkRpc = forkRpcCreator(child)

  child.on('close', (code) => {
    rpc.emit('watcher error', {
      name: 'child closed',
      message: `child exited with code ${code}`
    })
    forkRpc.destroy()
  })

  child.on('error', (error) => {
    rpc.emit('watcher error', { name: error.name, message: error.message, stack: error.stack })
  })

  if (rpc) { // sometimes I test from cli, in that case there's no rpc defined
    rpc.on('watch', args => forkRpc.emit('watch', args))
    rpc.on('unwatch', args => forkRpc.emit('unwatch', args))
    forkRpc.on('ready', () => rpc.emit('child process ready'))
    forkRpc.on('error', error => rpc.emit('watcher error', error))
    forkRpc.on('watcher ready', args => rpc.emit('watcher ready', args))
    forkRpc.on('watcher started', args => rpc.emit('watcher started', args))
    forkRpc.on('watcher set total files', args => rpc.emit('watcher set total files', args))
    forkRpc.on('watcher set processed files', args => rpc.emit('watcher set processed files', args))
    forkRpc.on('pipeline started', args => rpc.emit('pipeline started', args))
    forkRpc.on('pipeline complete', args => rpc.emit('pipeline complete', args))
    forkRpc.on('pipeline error', args => rpc.emit('pipeline error', args))
    forkRpc.on('pipeline log', args => rpc.emit('pipeline log', args))
  }

  forkRpc.emit('start')
  return child
}

export default Bot
