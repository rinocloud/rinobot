import walk from 'fs-walk'
import mergeHistorySync from './mergeHistorySync'
import readHistorySync from './readHistorySync'
import { checkIgnored } from './filters'
import _ from 'lodash'
import pt from 'path'

export default (opts, cb) => {
  const historyFile = opts.historyFile
  const pathBase = opts.localPathBase
  const ignoredFilter = opts.ignoredFilter
  const history = readHistorySync(historyFile)
  console.log('Updating history.json file...')

  walk.walkSync(pathBase, (basedir, filename, stat) => {
    if (stat.isFile()) {
      // present relative path in Rinocloud format: dir1/dir2/file.ext
      const ff = pt
        .relative(pathBase, pt.join(basedir, filename))
        .split(pt.sep)
        .reduce((pv, cv) => `${pv}/${cv}`)

      const ifIgnored = checkIgnored(ignoredFilter, filename)
      if (!_.has(history, ff) && ifIgnored !== 1) {
        console.log(`Adding to history.json: ${ff}`)
        // calculate etag
        // add correct fileStats
        mergeHistorySync(historyFile, ff, {}, () => {})
      }
      if (_.has(history, ff) && ifIgnored === 1) {
        // remove from history the record
      }
    }
  })
  console.log('Finished updating history.json file.')
  cb()
}
