import { fork, exec } from 'child_process'
import forkRpcCreator from './rpc-fork'
import pt from 'path'

export const updateRinobotPlugin = (cb) => {
  exec('pip install rinobot-plugin --upgrade', (error) => {
    if (error) cb(error)
    else cb()
  })
}


const Bot = () => {
  const child = fork(pt.join(__dirname, 'fork.js'))
  const forkRpc = forkRpcCreator(child)

  forkRpc.emit('start')

  child.on('error', error => {
    forkRpc.emit('error', error)
  })

  return { child, forkRpc }
}

export default Bot
