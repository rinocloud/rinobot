import { fork, exec } from 'child_process'
import forkRpcCreator from './rpc-fork'
import pt from 'path'

export const checkPythonVersion = (cb) => {
  // returns callback with values 2, 3 or false
  exec('python3 -V', (error) => {
    if (error) {
      exec('python -V', (error, stdout, stderr) => { // eslint-disable-line
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
    } else {
      cb('3')
    }
  })
}


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
