import remoteFileList from './remoteFileList'
import downloadFile from './downloadFile'
import pt from 'path'
import _ from 'lodash'
import {
  mergeHistory,
  readHistory,
  updateHistory,
  checkIgnored
} from '../history'


const apiToken = '8186755009251ef0bbb273fbc86d7b9caa228374'
const localDir = '/Users/eoinmurray/Desktop/test-sync'
const remoteDirID = 22624

const ignoredFilter = ['.db', 'history.json']
const historyFile = pt.join(localDir, 'history.json')

const opts = {
  apiToken,
  historyFile,
  ignoredFilter,
  localPathBase: localDir
}

console.log('Updating history file locally.')
updateHistory(opts, () => {
  console.log('History file was updated locally.')
  readHistory(historyFile, (err, history) => {
    console.log('Downloading remote file list.')
    remoteFileList({ id: remoteDirID, apiToken }, (er, list) => {
      console.log('Downloading files.')
      _.each(list, (value, key) => { // eslint-disable-line
        const fileInfo = JSON.parse(JSON.stringify(value))
        const ifIgnored = checkIgnored(ignoredFilter, fileInfo.name.split(/[/ ]+/).pop())
        if (ifIgnored !== 1) {
          if (!_.has(history, fileInfo.name)) {
            const fileStats = {
              created_on: fileInfo.created_on,
              lastUpdate: fileInfo.created_on,
              etag: fileInfo.etag,
              versions: [],
              id: fileInfo.id
            }
            downloadFile(opts, fileInfo, () => {
              mergeHistory(historyFile, fileInfo.name, fileStats, () => {
                console.log(`Downloading and updating history.json: ${fileInfo.name}`)
              })
            })
          } else {
            if (history[fileInfo.name].etag !== fileInfo.etag ||
                history[fileInfo.name].created_on !== fileInfo.created_on) {
              if (fileInfo.created_on < history[fileInfo.name].lastUpdate) {
                console.log(`Upload updated: ${fileInfo.name}`)
                // might need to add queues
                remoteFileList(opts, fileInfo.id, fileInfo.name, () => {
                  console.log('replaced')
                })
              }
            }
          }
        }
      })
      console.log('Finished downloading files.')
    })
  })
})
