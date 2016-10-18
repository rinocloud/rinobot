import remoteFileList from './remoteFileList'
import mergeHistorySync from './mergeHistorySync'
import { readHistoryFile } from './readHistory'
import updateHistorySync from './updateHistorySync'
import replaceFile from './replaceFile'
import { checkIgnored } from './filters'
import _ from 'lodash'
import downloadFileSync from './downloadFileSync'
import pt from 'path'

const apiToken = '8186755009251ef0bbb273fbc86d7b9caa228374'
const pathBase = '/Users/eoinmurray/Desktop/test-sync'
const watchedDirId = null
const ignoredFilter = ['.db', 'history.json']
const historyFile = pt.join(pathBase, 'history.json')

const opts = {
  apiToken,
  historyFile,
  ignoredFilter,
  localPathBase: pathBase
}

console.log('Updating history file locally.')
updateHistorySync(opts, () => {
  readHistoryFile(historyFile, (history) => {
    console.log('History file was updated locally.')
    console.log('Downloading remote file list.')
    remoteFileList({ id: watchedDirId, apiToken }, (err, list) => {
      console.log('Downloading files.', list)
      _(list).forEach((value, key) => { // eslint-disable-line
        const fileInfo = JSON.parse(JSON.stringify(value))
        const ifIgnored = checkIgnored(ignoredFilter, fileInfo.name.split(/[/ ]+/).pop())
        if (ifIgnored !== 1) {
          if (!_.has(history, fileInfo.name)) {
            const fileStats = {
              createdOn: fileInfo.created_on,
              lastSynchronization: fileInfo.created_on,
              lastUpdate: fileInfo.created_on,
              etag: fileInfo.etag,
              versions: [],
              id: fileInfo.id
            }
            downloadFileSync(opts, fileInfo, () => {
              mergeHistorySync(historyFile, fileInfo.name, fileStats, () => {
                console.log(`Downloading and updating history.json: ${fileInfo.name}`)
              })
            })
          } else {
            if (history[fileInfo.name].etag !== fileInfo.etag ||
                history[fileInfo.name].createdOn !== fileInfo.created_on) {
              if (fileInfo.created_on < history[fileInfo.name].lastUpdate) {
                console.log(`Upload updated: ${fileInfo.name}`)
                // might need to add queues
                replaceFile(opts, fileInfo.id, fileInfo.name, () => {
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
