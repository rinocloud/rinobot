import mv from 'mv'
import _ from 'lodash'
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
    mv(filepath, pt.join(_args, filename), { mkdirp: true, clobber: true }, err => {
      if (err) return onError(err)
      return onComplete()
    })
  })
}
