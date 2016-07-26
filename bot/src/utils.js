import pt from 'path'
import _ from 'lodash'

export const countWatched = (_watched) => {
  return flattenWatched(_watched).length
}


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
