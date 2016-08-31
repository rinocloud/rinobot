import fs from 'fs-extra'
import _ from 'lodash'

/*
  Usage:

    import readHistory from './readHistory'

    readHistory({
      historyFilePath: 'path/to/.rino/history.json',
      targetFilepath: '/path/to/somefile.txt',
    }, (err, historyOfFile) => {
      if (err) throw err;

      if (historyOfFile) {
        console.log(historyOfFile)
      }
    })
*/

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
