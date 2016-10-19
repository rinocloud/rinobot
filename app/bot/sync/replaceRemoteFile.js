import * as api from '../api/api.js'
import { mergeHistory, readHistory } from '../history'
import pt from 'path'

export const replaceRemoteFile = (opts, id, remoteFilePath, callback) => {
  const apiToken = opts.apiToken
  const historyFile = opts.historyFile
  const localPathBase = opts.localPathBase

  readHistory(historyFile, (history) => {
    const uploadInfo = { name: remoteFilePath, previousVers: id }

    const filePath = pt.join(
      localPathBase,
      remoteFilePath
        .split('/')
        .reduce((pv, cv) => pt.join(pv, cv))
    )

    const relFpath = pt
      .relative(localPathBase, filePath)
      .split(pt.sep)
      .reduce((pv, cv) => `${pv}/${cv}`)

    api.auth(apiToken)
    api.setBase('https://rinocloud.com')

    const progress = (total, loaded) => {
      const p = loaded * 100 / total
      console.log(`${p.toFixed(2)}%`)
    }

    const complete = (res) => {
      const fileInfo = JSON.parse(res.text)

      const vers = history[relFpath].versions
      const fileStats = {
        lastUpdate: fileInfo.created_on,
        etag: fileInfo.etag,
        versions: [...vers, fileInfo.metadata.previousVers],
        id: fileInfo.id
      }

      mergeHistory(historyFile, relFpath, fileStats, () => {
        console.log(`Replacing: ${fileInfo.name}`)
      })
      callback()
    }

    const error = (err) => {
      console.log(err)
    }

    api
      .deleteObject(id)
      .then(() => {
        api
          .s3uploadElectron(filePath, uploadInfo, progress, error, complete)
      })
      .catch(error)
  })
}

export default replaceRemoteFile
