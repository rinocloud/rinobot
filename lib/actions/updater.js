import { createAction } from 'redux-actions'
import rpc from '../rpc';

export const updateAvailable = createAction('UPDATE_AVAILABLE')

export const installUpdate = () => () => {
  rpc.emit('quit and install')
}
