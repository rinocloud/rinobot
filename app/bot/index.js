import { fork } from 'child_process'
import forkRpcCreator from './rpc-fork'
import pt from 'path'


const createBot = () => {
  const child = fork(pt.join(__dirname, 'fork.js'))
  const forkRpc = forkRpcCreator(child)

  forkRpc.emit('start')

  child.on('error', error => {
    forkRpc.emit('error', error)
  })

  return { child, forkRpc }
}

export default createBot
