import pt from 'path';
import { remote } from 'electron'

export default {
  pluginsDir: pt.join(remote.app.getPath('documents'), 'rinobot-plugins', 'node_modules'),
  pluginsPrefix: pt.join(remote.app.getPath('documents'), 'rinobot-plugins'),
}
