import { mergeHistory } from '../history'
import * as api from '../api/api.js'
import fs from 'fs'
import pt from 'path'
import mkdirp from 'mkdirp'
import _ from 'lodash'

export const downloadFiles = (opts) => {
  const {
    apiToken,
    localDir,
    remoteDir,
    filesToDownload,
    onFileProgress,
    onFileComplete
  } = opts

  _.each(filesToDownload, (remoteFile, name) => {
    downloadFile({
      apiToken,
      localDir,
      remoteDir,
      onFileProgress,
      onFileComplete,
      remoteFile: { name, ...remoteFile }
    })
  })
}

export const downloadFile = (opts) => {
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
            (e) => {
              if (e) throw e
            })
        })

        res.on('error', () => {
          throw new Error(`Download createWriteStream error for ${targetFilePath}`)
        })
      })
  })
}
