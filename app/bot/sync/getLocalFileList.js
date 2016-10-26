import _ from 'lodash'
import pt from 'path'
import walk from 'fs-walk'
import hashFile from '../utils/hashFile'
import {
  readHistory,
  checkIgnored,
  setHistory
} from '../history'

export const getLocalFileList = (opts, callback) => {
  /*
    walks the current dir and puts new files into the history

    Parameters
      opts: object with
        historyFilePath
        localDir
        ignoredFilter

      callback:
        function(error, history)

    it then walks through the history and removes entries for
    files which dont exist any more
  */

  // TODO: remove items from history that arent in the walkDir
  // i.e. remove deleted files.

  const {
    historyFilePath,
    localDir,
    ignoredFilter
  } = opts

  readHistory(historyFilePath, (err, _history) => {
    let history = _history || {}

    walk.walk(localDir, (basedir, filename, stat, next) => {
      if (!stat.isFile()) {
        return next()
      }

      const isIgnored = checkIgnored(ignoredFilter, filename)

      const relRinoFilePath = pt
        .relative(localDir, pt.join(basedir, filename))
        .split(pt.sep)
        .join('/')

      if (isIgnored && !_.has(history, relRinoFilePath)) {
        // the file is not in history and is ignored
        return next()
      }

      if (isIgnored && _.has(history, relRinoFilePath)) {
        // file is ignore and is in history
        history = _.omit(history, relRinoFilePath)
        return next()
      }

      if (!_.has(history, relRinoFilePath)) {
        // file not in history so lets hash it and add it
        hashFile(pt.join(basedir, filename), (er, hash) => {
          history[relRinoFilePath] = {
            created_on: null,
            lastUpdate: null,
            lastRun: null,
            etag: hash,
            completed: [],
            versions: [],
            id: null,
          }
          next()
        })
      } else {
        // the file is already in history, but we hash it to see if its changed
        hashFile(pt.join(basedir, filename), (er, hash) => {
          history[relRinoFilePath] = {
            ...history[relRinoFilePath],
            etag: hash,
          }
          next()
        })
      }
    }, (er) => {
      if (er) callback(null, er)

      setHistory(historyFilePath, history, callback)
    })
  })
}

export default getLocalFileList
