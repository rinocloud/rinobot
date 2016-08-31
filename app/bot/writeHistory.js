import fs from 'fs-extra'
export default (opts, cb) => {
  const {
    historyFilePath,
    targetFilepath,
    lastModified,
    etag,
    completed
  } = opts

  fs.readFile(historyFilePath, 'utf8', (err, data) => {
    if (err) cb(err)
    const history = JSON.parse(data)
    history[targetFilepath] = {
      lastModified,
      etag,
      completed
    }

    fs.writeFile(historyFilePath, JSON.stringify(history, null, 2), (err) => { // eslint-disable-line
      if (err) cb(err)
      else cb()
    })
  })
}
