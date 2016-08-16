import { fork, exec } from 'child_process'
import forkRpcCreator from './rpc-fork'
import pt from 'path'

export const checkPythonVersion = (cb) => {
  // returns callback with values 2, 3 or false
  exec('python -V', (error, stdout, stderr) => {
    if (error) cb(false)
    const re = /\w+\s(\d+\.\d+\.\d+)(\s+\w+)?/
    let m
    if ((m = re.exec(stderr)) !== null) { // eslint-disable-line
      if (m.index === re.lastIndex) {
        re.lastIndex++;
      }
      cb(m[1])
    } else {
      cb(false)
    }
  })
}

const Bot = (rpc) => {
  const child = fork(pt.join(__dirname, 'fork.js'))
  const forkRpc = forkRpcCreator(child)

  if (rpc) { // sometimes I test from cli, in that case there's no rpc defined
    rpc.on('watch', args => forkRpc.emit('watch', args))
    rpc.on('unwatch', args => forkRpc.emit('unwatch', args))
    forkRpc.on('ready', () => rpc.emit('child process ready'))
    forkRpc.on('watcher ready', args => rpc.emit('watcher ready', args))
    forkRpc.on('watcher started', args => rpc.emit('watcher started', args))
    forkRpc.on('watcher set total files', args => rpc.emit('watcher set total files', args))
    forkRpc.on('watcher set processed files', args => rpc.emit('watcher set processed files', args))
    forkRpc.on('pipeline started', args => rpc.emit('pipeline started', args))
    forkRpc.on('pipeline complete', args => rpc.emit('pipeline complete', args))
    forkRpc.on('pipeline error', args => rpc.emit('pipeline error', args))
    forkRpc.on('pipeline log', args => rpc.emit('pipeline log', args))
    forkRpc.on('task complete', args => rpc.emit('task complete', args))
    forkRpc.on('task started', args => rpc.emit('task started', args))
  }
  forkRpc.emit('start')
  return { bot: child, fork: forkRpc }
}

export default Bot
