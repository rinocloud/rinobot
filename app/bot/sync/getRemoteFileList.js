import * as api from '../api/api.js'
import _ from 'lodash'
import async from 'async'

export const getRemoteFileList = (opts, callback) => {
  /*
    Returns the list of files on Rinocloud relative to the starting remote dir. So
    if testFolder is the folder to be synched then testFolder/file.txt will be named
    just file.txt
  */
  const { apiToken, remoteDir } = opts

  api.auth(apiToken)
  api.setBase('https://rinocloud.com')

  return getRemoteDirList({ id: remoteDir.id, path: '' }, (err, res) => {
    const remoteList = _.reduce(res, (r, item) => {
      r[item.name] = _.omit(item, 'name') // eslint-disable-line
      return r
    }, {})

    callback(err, remoteList)
  })
}


const getRemoteDirList = ({ id, path }, callback) => {
  if (_.isUndefined(id) || _.isUndefined(path)) {
    throw new Error('Path or id is undefined for getRemoteDirList')
  }

  api
    .getChildren(id, 1000000, 0)
    .then((payload) => {
      let childrenJSON = JSON.stringify(payload)
      childrenJSON = JSON.parse(childrenJSON)
      childrenJSON = childrenJSON.result
      return async.map(childrenJSON, (record, cb) => {
        if (record.type === 'folder') {
          getRemoteDirList({
            id: record.id,
            path: `${path}${record.name}/`
          }, cb)
        } else if (record.type === 'file') {
          cb(null, {
            name: path + record.name,
            id: record.id,
            created_on: record.created_on,
            etag: record.etag
          })
        } else {
          cb(null, null)
        }
      }, (err, res) => {
        const flat = _.flatMapDeep(res)
        const filtered = _.filter(flat, i =>
          !_.isNull(i) && !_.isUndefined(i)
        )

        callback(null, filtered)
      })
    })
    .catch((err) => {
      console.log(err)
    })
}

export default getRemoteFileList
