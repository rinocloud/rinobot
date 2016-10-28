import { exec } from 'child_process'

export const updateRinobotPlugin = (cb) => {
  exec('pip install rinobot-plugin --upgrade', (error) => {
    if (error) {
      cb(error)
    } else {
      cb()
    }
  })
}

export default updateRinobotPlugin
