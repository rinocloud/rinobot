import _ from 'lodash'

export const diffLists = (localList, remoteList) => {
  const filesToUpload = {}
  const filesToDownload = {}
  const newerRemoteFiles = {}
  const newerLocalFiles = {}

  // First loop over all the local files
  _.each(localList, (localFile, name) => {
    if (!_.has(remoteList, name)) {
      // the file does not exist on remote server
      filesToUpload[name] = localFile
    } else {
      // file exists locally and remotely
      const remoteFile = remoteList[name]
      if (remoteFile.etag !== localFile.etag) {
        console.log(`${name} etag diff\n\tremote:\t${remoteFile.etag}\n\tlocal:\t${localFile.etag}`)
        if (remoteFile.id > localFile.id) {
          // file contents are different and remote file is newer - so we need to update
          // the local copy
          newerRemoteFiles[name] = remoteFile
        } else {
          // file contents are different and the id are the same, this means that the local
          // file has changed - so we need to update the remote copy
          newerLocalFiles[name] = localFile
        }
      }

      if (remoteFile.etag === localFile.etag && remoteFile.id !== localFile.id) {
        if (remoteFile.id > localFile.id) {
          // file contents are same and remote file is newer - so we to update
          // the local copy
          newerRemoteFiles[name] = remoteFile
        }
      }
    }
  })

  // Then loop over the remote files
  // we dont need to check the update stuff here
  // since any files in both lists have already been checked
  _.each(remoteList, (remoteFile, name) => {
    if (!_.has(localList, name)) {
      // the file does not exist locally
      filesToDownload[name] = remoteFile
    }
  })

  return {
    filesToUpload,
    filesToDownload,
    newerRemoteFiles,
    newerLocalFiles
  }
}

export default diffLists
