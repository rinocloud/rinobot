import pt from 'path'
import globule from 'globule'
import _ from 'lodash'
import { exec } from 'child_process'


export const flattenWatched = (_watched) =>
  _.flatten(
    _.map(_watched, (relPaths, basePath) =>
      _.reduce(relPaths, (arr, relPath) => {
        const d = pt.join(basePath, relPath)
        if (!_watched.hasOwnProperty(d)) {
          arr.push(d)
        }
        return arr
      }
      , [])
    )
  )

export const checkPythonVersion = (cb) => {
  // returns callback with values 2, 3 or false
  exec('python3 -V', (error) => {
    if (error) {
      exec('python -V', (error) => { // eslint-disable-line
        if (error) cb(false)
        else cb('python')
      })
    } else {
      cb('python3')
    }
  })
}

export const isMatch = (match, filename) => {
  const patterns = match.split(',')
  let passing = false

  _.each(patterns, (pattern) => {
    if (globule.isMatch(pattern.replace('!', ''), filename)) {
      passing = true
    }

    if (pattern[0] === '!' && globule.isMatch(pattern.replace('!', ''), filename)) {
      passing = false
    }
  })

  return passing
}
