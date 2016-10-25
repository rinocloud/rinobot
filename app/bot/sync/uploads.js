import { readHistory, mergeHistory } from '../history'
import * as api from '../api/api.js'
import pt from 'path'
import _ from 'lodash'

export const uploadFiles = (opts) => {
  const {
    apiToken,
    localDir,
    filesToUpload,
    onFileProgress,
    onFileComplete,
    remoteDir
  } = opts

  _.each(filesToUpload, (localFile, name) => {
    uploadFile({
      apiToken,
      localDir,
      onFileProgress,
      onFileComplete,
      remoteDir,
      localFile: { name, ...localFile }
    })
  })
}


export const uploadFile = (opts) => {
  const {
    apiToken,
    localDir,
    onFileProgress,
    onFileComplete,
    localFile,
    remoteDir
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

export default uploadFile
