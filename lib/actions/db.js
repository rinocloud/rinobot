
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

db.settings = new Datastore({
  filename: `${remote.app.getPath('userData')}/settings.db`,
  autoload: true
})

db.pipelines = new Datastore({
  filename: `${remote.app.getPath('userData')}/pipelines.db`,
  autoload: true
})

db.metadataTemplates = new Datastore({
  filename: `${remote.app.getPath('userData')}/metadataTemplates.db`,
  autoload: true
})

window.db = db

export default db
