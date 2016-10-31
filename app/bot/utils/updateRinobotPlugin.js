import { exec } from 'child_process'
import { getPipPath } from './pythonKernel'

export const updateRinobotPlugin = (callback) => {
  getPipPath((err, pip) => {
    exec(`${pip} install rinobot-plugin --upgrade`, (error) => {
      if (error) {
        callback(error)
      } else {
        callback()
      }
    })
  })
}

export default updateRinobotPlugin
