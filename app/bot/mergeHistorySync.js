import fs from 'fs-extra'
import _ from 'lodash'
import pt from 'path'
import mkdirp from 'mkdirp'
import moment from 'moment'

export default (historyFilePath, targetFilepath, obj, cb) => {
  try {
    
    mkdirp.sync(pt.dirname(historyFilePath))
    let history
    try {
      let data =  fs.readFileSync(historyFilePath, 'utf8')
      history = JSON.parse(data)
    } catch(err)  {
      if (err && err.code !== 'ENOENT') return cb(err)
      if (err && err.code === 'ENOENT') {history = {}}
    }
    
    if (_.has(history, targetFilepath)) {
      history[targetFilepath] = {
        ...history[targetFilepath],
        ...obj
      }
    } else {
      history[targetFilepath] = {
        createdOn: null,
        lastSynchronization: null,
        lastUpdate: null,
        lastRun: null,
        etag: null,
        //completed: [],
        versions: [],
        id: null,
        ...obj
      }
    }

    try {
       fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2))
       cb()
     } catch(err) {
        cb(err)
     }

  } catch(err) {
    return cb(err)
  }
}

