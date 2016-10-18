import * as api from '../api/api.js'
import _ from 'lodash'
import async from 'async'

export default (opts, callback) => {
  const apiToken = opts.apiToken
  const id = opts.id
  api.auth(apiToken)
  api.setBase('https://rinocloud.com')
  let pathBase = ''
  return api
    .getAncestors(id)
    .then((payload) => {
      _.forEach(payload, (parent) => {
        let parentJSON = JSON.stringify(parent)
        parentJSON = JSON.parse(parentJSON)
        pathBase += `${parentJSON.name}/`
      })
      return remoteDirList(id, pathBase, (err, res) => {
        callback(err, res)
      })
    })
    .catch(() => { // eslint-disable-line
      return remoteDirList(id, '', (err, res) => {
        callback(err, res)
      })
    })
}


const remoteDirList = (id, pathBase, callback) => {
  api
    .getChildren(id, 1000000, 0)
    .then((payload) => {
      let childrenJSON = JSON.stringify(payload)
      childrenJSON = JSON.parse(childrenJSON)
      childrenJSON = childrenJSON.result
      return async.map(childrenJSON, (record, cb) => {
        if (record.type === 'folder') {
          remoteDirList(record.id, `${pathBase}${record.name}/`, cb)
        } else if (record.type === 'file') {
          cb(null, {
            name: pathBase + record.name,
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
