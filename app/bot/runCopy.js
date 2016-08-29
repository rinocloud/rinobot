import _ from 'lodash'
import fs from 'fs-extra'
import pt from 'path'
import swig from 'swig'
import fetchMetadata from './fetchMetadata'

export default (opts) => {
  const filepath = opts.filepath
  const filename = opts.filename
  const args = opts.args
  const locals = opts.locals

  const onError = opts.onError
  const onComplete = opts.onComplete

  fetchMetadata(filepath, (err, metadata) => {
    if (err) {
      return onError(err)
    }
    const _args = _.trim(swig.render(args, { locals, ...metadata }))
    fs.copy(filepath, pt.join(_args, filename), err => {
      if (err) return onError(err)
      return onComplete()
    })
  })
}
