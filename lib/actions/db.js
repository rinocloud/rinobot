
import Datastore from 'nedb'
import { remote } from 'electron'

export const db = {}

db.auth = new Datastore({
  filename: `${remote.app.getPath('userData')}/auth.db`,
  autoload: true
})

db.fs = new Datastore({
  filename: `${remote.app.getPath('userData')}/fs.db`,
  autoload: true
})

db.plugins = new Datastore({
  filename: `${remote.app.getPath('userData')}/plugins.db`,
  autoload: true
})

db.watcher = new Datastore({
  filename: `${remote.app.getPath('userData')}/watcher.db`,
  autoload: true
})

export default db
