import * as api from '../api/api.js'

export const getRemotePath = (opts, callback) => {
  /*
    All this does is resolve the full path of a remote dir
  */
  const { apiToken, remoteDirID } = opts

  api.auth(apiToken)
  api.setBase('https://rinocloud.com')

  api
    .getAncestors(remoteDirID)
    .then((list) => {
      let remotePath = ''
      list.forEach((parent) => {
        let parentJSON = JSON.stringify(parent)
        parentJSON = JSON.parse(parentJSON)
        remotePath += `${parentJSON.name}/`
      })

      callback(null, remotePath)
    })
    .catch(callback)
}

export default getRemotePath
