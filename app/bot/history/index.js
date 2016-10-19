import fs from 'fs-extra'
import _ from 'lodash'
import pt from 'path'
import mkdirp from 'mkdirp'
import moment from 'moment'
import walk from 'fs-walk'

export const checkIgnored = (ss, fn) => {
  const aa = []
  _(ss).forEach((value) => {
    aa.push(fn.indexOf(value))
  })
  const x = (_.max(aa) > -1) ? '1' : '0'
  return x
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
        history = JSON.parse(data)
      }

      if (_.has(history, targetFilepath)) {
        history[targetFilepath] = {
          ...history[targetFilepath],
          ...obj
        }
      } else {
        history[targetFilepath] = {
          createdOn: moment().toISOString(),
          lastSynchronization: null,
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
    const history = JSON.parse(data)

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
    const createdList = JSON.parse(data)

    if (!createdList) return cb(null, null)

    return cb(null, createdList)
  })
}

export const updateHistory = (opts, cb) => {
  const historyFile = opts.historyFile
  const pathBase = opts.localPathBase
  const ignoredFilter = opts.ignoredFilter
  readHistory(historyFile, (err, history) => {
    console.log('Updating history.json file...')
    walk.walk(pathBase, (basedir, filename, stat, next) => {
      if (stat.isFile()) {
        const relRinoFilePath = pt
          .relative(pathBase, pt.join(basedir, filename))
          .split(pt.sep)
          .join('/')

        const isIgnored = checkIgnored(ignoredFilter, filename)
        if (!_.has(history, relRinoFilePath) && isIgnored !== 1) {
          console.log(`Adding to history.json: ${relRinoFilePath}`)
          mergeHistory(historyFile, relRinoFilePath, {}, next)
        }
        if (_.has(history, relRinoFilePath) && isIgnored === 1) {
          // remove from history the record
          next()
        }
      } else {
        next()
      }
    }, (er) => {
      console.log('Finished updating history.json file.')
      cb(er)
    })
  })
}
