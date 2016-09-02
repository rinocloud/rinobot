import { spawn } from 'child_process'
import _ from 'lodash'
import swig from 'swig'

export default (opts) => {
  const codePath = opts.codePath
  const locals = opts.locals
  const cwd = opts.cwd

  const onError = opts.onError
  const onLog = opts.onLog
  const onComplete = opts.onComplete

  const args = _.trim(swig.render(`${codePath} {{filepath}}`, { locals }))
  const magicDelimiter = ',,,xxx123'
  const tokens = _.map(args.split(/\\ /g).join(magicDelimiter).split(' '), (arg) =>
    arg.split(new RegExp(magicDelimiter, 'g')).join('\ ') // eslint-disable-line
  )

  const child = spawn('Rscript', tokens, { cwd })

  child.on('error', (error) => {
    child.error = true
    return onError(error)
  })

  child.stdout.on('data', (b) => onLog(b.toString()))

  child.stderr.on('data', (b) => onLog(b.toString()))

  child.on('close', (code) => {
    if (child.hasOwnProperty('error')) return

    if (code !== 0) {
      return onError(
        new Error(
          `An error occured (code ${code}) while running "${codePath} ${args.split('  ')}"`))
    } else { // eslint-disable-line
      return onComplete()
    }
  })
}
