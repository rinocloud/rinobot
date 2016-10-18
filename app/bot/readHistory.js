import fs from 'fs-extra'
import _ from 'lodash'

export default (historyFilePath, targetFilepath, cb) => {
  fs.readFile(historyFilePath, 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') return cb(err, null)
    if (err && err.code === 'ENOENT') return cb(null, null)
    const history = JSON.parse(data)

    if (_.has(history, targetFilepath)) {
      cb(null, history[targetFilepath])
    } else {
      cb(null, null)
    }
  })
}

export const readHistoryFile = (historyFilePath, cb) => {
  fs.readFile(historyFilePath, 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') return cb(err, null)
    if (err && err.code === 'ENOENT') return cb(null, null)
    const history = JSON.parse(data)
    cb(null, history)
  })
}
