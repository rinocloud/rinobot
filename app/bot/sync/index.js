import pt from 'path'
import getRemotePath from './getRemotePath'
import getLocalFileList from './getLocalFileList'
import getRemoteFileList from './getRemoteFileList'
import diffLists from './diffLists'
import { downloadFiles } from './downloads'
import { uploadFiles } from './uploads'
import { updateLocalFiles, updateRemoteFiles  } from './updates'

const apiToken = '8186755009251ef0bbb273fbc86d7b9caa228374'
const localDir = '/Users/eoinmurray/Desktop/Rinobot/sync-test'
const remoteDirID = 24854
const ignoredFilter = ['.db', 'history.json', '.DS_Store']
const historyFilePath = pt.join(localDir, 'history.json')

/*
  Lets resolve the full remote path of the remoteDirID
*/
getRemotePath({ apiToken, remoteDirID }, (error, remotePath) => {
  if (error) throw error;

  const remoteDir = {
    id: remoteDirID,
    path: remotePath
  }

  console.log(`Starting sync for remote folder ${remoteDir.path} (#${remoteDir.id})`)

  /*
    Then lets get a list of all the local files
  */
  getLocalFileList({ historyFilePath, localDir, ignoredFilter }, (err, localList) => {
    if (err) throw err;
    /*
      Lets get a list of all the remote files
    */
    getRemoteFileList({ apiToken, remoteDir }, (er, remoteList) => {
      if (er) throw er;
      /*
        Now that we have a list of the remote and local files
        lets diff them to get the list of files to upload, download and update.
      */
      const lists = diffLists(localList, remoteList)

      const {
        filesToUpload,
        filesToDownload,
        newerRemoteFiles,
        newerLocalFiles
      } = lists

      /*
        First we handle the download, then the uploads
        TODO: handle the newerRemoteFiles and newerLocalFiles
      */

      downloadFiles({
        apiToken,
        localDir,
        remoteDir,
        filesToDownload,
        onFileProgress: (remoteFileName, totalSize, currentSize) => {
          console.log(
            `Downloading ${remoteFileName}: ${(100.0 * currentSize / totalSize).toFixed(2)}%`
          )
        },
        onFileComplete: (e) => { if (e) throw e }
      })

      uploadFiles({
        apiToken,
        localDir,
        filesToUpload,
        remoteDir,
        onFileProgress: (remoteFileName, totalSize, currentSize) => {
          console.log(
            `Uploading ${remoteFileName}: ${(100.0 * currentSize / totalSize).toFixed(2)}%`
          )
        },
        onFileComplete: (e) => { if (e) throw e }
      })

      // updateRemoteFiles({
      //   apiToken,
      //   localDir,
      //   newerLocalFiles,
      //   remoteDir,
      //   onFileProgress: (remoteFileName, totalSize, currentSize) => {
      //     console.log(
      //       `Updating ${remoteFileName}: ${(100.0 * currentSize / totalSize).toFixed(2)}%`
      //     )
      //   },
      //   onFileComplete: (e) => { if (e) throw e }
      // })
    })
  })
})
