import { readHistory, mergeHistory } from '../history'
import * as api from '../api/api.js'
import pt from 'path'
import _ from 'lodash'
import fs from 'fs'
import mkdirp from 'mkdirp'

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

  api.auth(apiToken)
  api.setBase('https://rinocloud.com')

  const targetFilePath = pt.join(localDir, remoteFile.name.replace(remoteDir.path, ''))
  const targetFileDir = pt.dirname(targetFilePath)

  mkdirp(targetFileDir, (er) => {
    if (er) throw er;
    fs.unlink(targetFilePath, (e) => {
      if (e) throw e;
      api
        .s3_download(remoteFile.id, (err, res) => {
          const stream = fs.createWriteStream(targetFilePath)
          const rinoObj = JSON.parse(res.headers['rinocloud-api-result'])

          let currentSize = 0
          const totalSize = rinoObj.size

          res.on('data', (chunk) => {
            stream.write(chunk)
            currentSize += chunk.length
            onFileProgress(remoteFile.name, totalSize, currentSize)
          })
          res.on('end', () => {
            stream.end()
            onFileComplete(null)

            const prev = rinoObj.previousVersions || []

            const fileStats = {
              created_on: rinoObj.created_on,
              lastUpdate: rinoObj.created_on,
              etag: rinoObj.etag,
              versions: [...prev, rinoObj.id],
              id: rinoObj.id
            }

            mergeHistory(
              pt.join(localDir, 'history.json'),
              remoteFile.name.replace(remoteDir.path, ''),
              fileStats,
              (error) => {
                if (error) throw error
              })
          })

          res.on('error', () => {
            throw new Error(`Download createWriteStream error for ${targetFilePath}`)
          })
        })
    })
  })
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
    updateRemoteFile({
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
      .deleteObject(history.id)
      .then(() => {
        api
          .s3uploadElectron(
            localFilePath,
            { name: localFile.name, parent: remoteDir.id, previousVersions: history.versions },
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
      .catch(onFileComplete)
  })
}
