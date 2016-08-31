import fs from 'fs-extra'
import _ from 'lodash'
import pt from 'path'
import mkdirp from 'mkdirp'
import moment from 'moment'

export default (historyFilePath, targetFilepath, obj, cb) => {
  mkdirp(pt.dirname(historyFilePath), (error) => {
    if (error) return cb(error)

    fs.readFile(historyFilePath, 'utf8', (err, data) => {
      if (err && err.code !== 'ENOENT') return cb(err)

      let history
      if (err && err.code === 'ENOENT') {
        history = {}
      } else {
        history = JSON.parse(data)
      }

      if (_.has(history, targetFilepath)) {
        history[targetFilepath] = {
          ...history[targetFilepath],
          ...obj
        }
      } else {
        history[targetFilepath] = {
          createdOn: moment().toISOString(),
          lastSynchronization: null,
          lastRun: null,
          etag: null,
          completed: [],
          id: null,
          ...obj
        }
      }

      fs.writeFile(historyFilePath, JSON.stringify(history, null, 2), (err) => { // eslint-disable-line
        if (err) cb(err)
        else cb()
      })
    })
  })
}
