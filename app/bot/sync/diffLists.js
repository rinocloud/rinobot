import _ from 'lodash'

export const diffLists = (localList, remoteList) => {
  const filesToUpload = {}
  const filesToDownload = {}
  const localFilesToUpdate = {}
  const remoteFilesToUpdate = {}

  // First loop over all the local files
  _.each(localList, (localFile, name) => {
    if (!_.has(remoteList, name)) {
      // the file does not exist on remote server
      filesToUpload[name] = localFile
    } else {
      // file exists locally and remotely
      const remoteFile = remoteList[name]

      if (remoteFile.etag !== localFile.etag && remoteFile.id > localFile.id) {
        // file contents are different and remote file is newer - so we need to update
        // the local copy
        localFilesToUpdate[name] = remoteFile
      }
      if (remoteFile.etag !== localFile.etag && remoteFile.id < localFile.id) {
        // file contents are different and local file is newer - so we need to update
        // the remote copy
        remoteFilesToUpdate[name] = localFile
      }

      if (remoteFile.etag === localFile.etag && remoteFile.id !== localFile.id) {
        // file contents are the same but ids are different - I think this is an error
        throw new Error(
          `File contents (${name}) are the same but ids (remote: ${remoteFile.id}, local:
            ${localFile.id}) are different.`
        )
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
    localFilesToUpdate,
    remoteFilesToUpdate
  }
}

export default diffLists
