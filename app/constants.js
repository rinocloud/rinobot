import pt from 'path';
import { remote } from 'electron'

export default {
  oauth2: {
    grant_type: 'password',
    client_id: 'MwtxN8YerqSglvo07qL6mZZlngX08QJpEcTJtKw5'
  },
  authFilePath: pt.join(remote.app.getPath('userData'), 'auth.json'),
  packagesFilePath: pt.join(remote.app.getPath('userData'), 'packages.json'),
  watcherFilePath: pt.join(remote.app.getPath('userData'), 'watcher.json'),
  packagesDir: pt.join(remote.app.getPath('userData'), 'packages'),
}