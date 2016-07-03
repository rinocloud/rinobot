import pt from 'path';
var remote = require('electron').remote

export default {
  oauth2: {
    grant_type: 'password',
    client_id: 'MwtxN8YerqSglvo07qL6mZZlngX08QJpEcTJtKw5'
  },
  authFilePath: pt.join(remote.app.getPath('userData'), 'auth.json'),
  packagesFilePath: pt.join(remote.app.getPath('userData'), 'packages.json'),
  packagesDir: pt.join(remote.app.getPath('userData'), 'packages'),
}
