import { spawn } from 'child_process'
import pt from 'path'

export default (opts) => {
  const codePath = opts.codePath
  const locals = opts.locals
  const cwd = opts.cwd

  const onError = opts.onError
  const onLog = opts.onLog
  const onComplete = opts.onComplete

  const args = [codePath, locals.filepath]

  const rPath = opts.root ?
    pt.join(opts.root, 'Rscript') : 'Rscript'

  const child = spawn(rPath, args, { cwd })

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
          `An error occured (code ${code}) while running "Rscript ${args}"`))
    } else { // eslint-disable-line
      return onComplete()
    }
  })
}
