import { checkPythonVersion } from './utils'
import { spawn } from 'child_process'

export default (opts) => {
  const codePath = opts.codePath
  const locals = opts.locals
  const cwd = opts.cwd

  const onError = opts.onError
  const onLog = opts.onLog
  const onComplete = opts.onComplete

  const args = [codePath, locals.filepath]

  checkPythonVersion(python => {
    if (!python) {
      return this.onError(
        new Error('No python installed'))
    } else { // eslint-disable-line

      const child = spawn(python, args, { cwd })

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
              `An error occured (code ${code}) while running "${python}\n${args.split('  ')}"`))
        } else { // eslint-disable-line
          return onComplete()
        }
      })
    }
  })
}
