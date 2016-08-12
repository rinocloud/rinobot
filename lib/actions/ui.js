import { createAction } from 'redux-actions'
import rpc from '../rpc';

export const updateAvailable = createAction('UPDATE_AVAILABLE')
export const pythonVersion = createAction('PYTHON_VERSION')
export const rinobotVersion = createAction('RINOBOT_VERSION')

export const installUpdate = () => () => {
  rpc.emit('quit and install')
}
