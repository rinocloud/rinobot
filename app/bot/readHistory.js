import fs from 'fs-extra'
import _ from 'lodash'

export default (historyFilePath, targetFilepath, cb) => {
  if (_.isUndefined(cb)) {
    cb = targetFilepath // eslint-disable-line
    targetFilepath = false // eslint-disable-line
  }

  fs.readFile(historyFilePath, 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') return cb(err, null)
    if (err && err.code === 'ENOENT') return cb(null, null)
    const history = JSON.parse(data)

    if (!history) return cb(null, null)

    if (!targetFilepath) {
      return cb(null, history)
    }

    if (_.has(history, targetFilepath)) {
      return cb(null, history[targetFilepath])
    }

    return cb(null, null)
  })
}
