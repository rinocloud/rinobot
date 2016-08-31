import fs from 'fs-extra'
import _ from 'lodash'

export default (opts, cb) => {
  const {
    historyFilePath,
    targetFilepath,
  } = opts

  fs.readFile(historyFilePath, 'utf8', (err, data) => {
    if (err) cb(err, null)
    const history = JSON.parse(data)

    if (_.hash(history, targetFilepath)) {
      cb(null, history[targetFilepath])
    } else {
      cb(null, null)
    }
  })
}
