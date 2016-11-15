import fs from 'fs-extra'
import _ from 'lodash'
import pt from 'path'
import mkdirp from 'mkdirp'
import moment from 'moment'

/*
  history schema

  created_on:            ISODateString
    The date that the file was created on Rinocloud
  lastUpdate:           ISODateString
    The date of the creation of the latest version on Rinocloud
  lastRun:              ISODateString
    The last time a task was run on this file - is used in the user interface
  etag:                 String
    The AWS S3 compatible file hash
  completed:            Array
    List of completed tasks
  versions:             Array
    List of Rinocloud IDs corresponding to previous versions
  id:                   Int
    Rinocloud id - null if file hasnt been uploaded yet
*/

export const checkIgnored = (ss, fn) => {
  const aa = []
  _(ss).forEach((value) => {
    aa.push(fn.indexOf(value))
  })
  return _.max(aa) > -1
}

export const setHistory = (historyFilePath, history, cb) => {
  fs.writeFile(historyFilePath, JSON.stringify(history, null, 2), (err) => { // eslint-disable-line
    if (err) cb(err, null)
    else cb(null, history)
  })
}

export const mergeHistory = (historyFilePath, targetFilepath, obj, cb) => {
  mkdirp(pt.dirname(historyFilePath), (error) => {
    if (error) return cb(error, null)

    fs.readFile(historyFilePath, 'utf8', (err, data) => {
      if (err && err.code !== 'ENOENT') return cb(err, null)

      let history
      if (err && err.code === 'ENOENT') {
        history = {}
      } else {
        try {
          history = JSON.parse(data)
        } catch (e) {
          history = {}
        }
      }

      if (_.has(history, targetFilepath)) {
        history[targetFilepath] = {
          ...history[targetFilepath],
          ...obj
        }
      } else {
        history[targetFilepath] = {
          created_on: moment().toISOString(),
          lastUpdate: null,
          lastRun: null,
          etag: null,
          completed: [],
          versions: [],
          id: null,
          ...obj
        }
      }

      fs.writeFile(historyFilePath, JSON.stringify(history, null, 2), (err) => { // eslint-disable-line
        if (err) cb(err, null)
        else cb(null, history)
      })
    })
  })
}

export const readHistory = (historyFilePath, targetFilepath, cb) => {
  if (_.isUndefined(cb)) {
    cb = targetFilepath // eslint-disable-line
    targetFilepath = false // eslint-disable-line
  }

  fs.readFile(historyFilePath, 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') return cb(err, null)
    if (err && err.code === 'ENOENT') return cb(null, null)

    let history = null
    try {
      history = JSON.parse(data)
    } catch (e) {
      return cb(err, null)
    }

    if (!history) return cb(null, null)

    if (!targetFilepath) {
      return cb(null, history)
    }

    if (_.has(history, targetFilepath)) {
      return cb(null, history[targetFilepath])
    }

    return cb(null, null)
  })
}

export const addCreated = (createdFilePath, targetFilepath, cb) => {
  mkdirp(pt.dirname(createdFilePath), (error) => {
    if (error) return cb(error, null)

    fs.readFile(createdFilePath, 'utf8', (err, data) => {
      if (err && err.code !== 'ENOENT') return cb(err, null)

      let createdList
      if (err && err.code === 'ENOENT') {
        createdList = []
      } else {
        createdList = JSON.parse(data)
      }

      if (!createdList.includes(targetFilepath)) {
        createdList.push(targetFilepath)
      }

      fs.writeFile(createdFilePath, JSON.stringify(createdList, null, 2), (err) => { // eslint-disable-line
        if (err) cb(err, null)
        else cb(null, createdList)
      })
    })
  })
}

export const readCreated = (createdFilePath, cb) => {
  fs.readFile(createdFilePath, 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') return cb(err, null)
    if (err && err.code === 'ENOENT') return cb(null, null)

    let createdList = null
    try {
      createdList = JSON.parse(data)
    } catch (e) {
      return cb(err, null)
    }

    if (!createdList) return cb(null, null)

    return cb(null, createdList)
  })
}
