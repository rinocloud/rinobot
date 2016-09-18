import { spawn } from 'child_process'
import _ from 'lodash'
import swig from 'swig'
import fetchMetadata from './fetchMetadata'

export default (opts) => {
  const locals = opts.locals
  const cwd = opts.cwd
  const command = opts.command
  const args = opts.args

  const onError = opts.onError
  const onLog = opts.onLog
  const onComplete = opts.onComplete

  fetchMetadata(locals.filepath, (err, metadata) => {
    if (err) {
      return onError(err)
    }
    const _args = _.trim(swig.render(args, { locals, ...metadata }))
    const magicDelimiter = ',,,xxx123'
    const tokens = _.map(_args.split(/\\ /g).join(magicDelimiter).split(' '), (arg) =>
      arg.split(new RegExp(magicDelimiter, 'g')).join('\ ') // eslint-disable-line
    )

    const child = spawn(command, tokens, { cwd })

    child.on('error', (error) => {
      child.error = true
      return onError(error)
    })

    child.stdout.on('data', onLog)

    child.stderr.on('data', onLog)

    child.on('close', (code) => {
      if (child.hasOwnProperty('error')) return

      if (code !== 0) {
        return onError(
          new Error(
            `An error occured (code ${code}) while running "${command} ${_args.split('  ')}"`))
      } else { // eslint-disable-line
        return onComplete()
      }
    })
  })
}
