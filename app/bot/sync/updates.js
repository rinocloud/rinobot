import { readHistory, mergeHistory } from '../history'
import * as api from '../api/api.js'
import pt from 'path'
import _ from 'lodash'

export const updateLocalFiles = (opts) => {
  const {
    apiToken,
    localDir,
    remoteDir,
    newerRemoteFiles,
    onFileProgress,
    onFileComplete
  } = opts

  _.each(newerRemoteFiles, (remoteFile, name) => {
    updateLocalFile({
      apiToken,
      localDir,
      remoteDir,
      onFileProgress,
      onFileComplete,
      remoteFile: { name, ...remoteFile }
    })
  })
}

export const updateLocalFile = (opts) => {
  const {
    apiToken,
    localDir,
    remoteDir,
    onFileProgress,
    onFileComplete,
    remoteFile
  } = opts
}

export const updateRemoteFiles = (opts) => {
  const {
    apiToken,
    localDir,
    remoteDir,
    newerLocalFiles,
    onFileProgress,
    onFileComplete
  } = opts

  _.each(newerLocalFiles, (localFile, name) => {
    updateLocalFile({
      apiToken,
      localDir,
      remoteDir,
      onFileProgress,
      onFileComplete,
      localFile: { name, ...localFile }
    })
  })
}

export const updateRemoteFile = (opts) => {
  const {
    apiToken,
    localDir,
    remoteDir,
    onFileProgress,
    onFileComplete,
    localFile
  } = opts

  const localFilePath = pt.join(localDir, localFile.name)

  api.auth(apiToken)
  api.setBase('https://rinocloud.com')

  readHistory(pt.join(localDir, 'history.json'), localFile.name, (err, history) => {
    api
      .s3uploadElectron(
        localFilePath,
        { name: localFile.name, parent: remoteDir.id },
        (totalSize, currentSize) => onFileProgress(localFile.name, totalSize, currentSize),
        onFileComplete,
        (res) => {
          const fileInfo = res.body

          const fileStats = {
            created_on: fileInfo.created_on,
            lastUpdate: fileInfo.created_on,
            etag: fileInfo.etag,
            versions: [...history.versions, fileInfo.id],
            id: fileInfo.id
          }

          mergeHistory(
            pt.join(localDir, 'history.json'),
            localFile.name,
            fileStats,
            (e) => {
              if (e) throw e
            })
        }
      )
  })

}
