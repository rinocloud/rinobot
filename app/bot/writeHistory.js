import fs from 'fs-extra'

/*
  Usage:

    import writeHistory from './writeHistory'

    writeHistory({
      historyFilePath: 'path/to/.rino/history.json',
      targetFilepath: '/path/to/somefile.txt',
      lastModified: 'ISO datetime string',
      etag: '34h9834gh39u4h9384hgu3948hg',
      completed: [ // list of completed task hashes
        'as4390a439043433434v',
        '4a34q34gq334gq34gq34w'
      ]
    }, (err) => {
      if (err) throw err;
    })
*/

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
