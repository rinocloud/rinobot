import { checkPythonVersion } from '../utils'
import { spawn } from 'child_process'

export default (opts) => {
  const codePath = opts.codePath
  const locals = opts.locals
  const cwd = opts.cwd

  const onError = opts.onError
  const onLog = opts.onLog
  const onComplete = opts.onComplete

  const args = [codePath, locals.filepath]

  checkPythonVersion(pythonVersion => {
    if (!pythonVersion) {
      return this.onError(
        new Error('No python installed'))
    } else { // eslint-disable-line

      const child = spawn(`python${pythonVersion}`, args, { cwd })

      child.on('error', (error) => {
        child.error = true
        return onError(error)
      })

      child.stdout.on('data', (b) => onLog(b.toString()))

      let errLog = ''
      child.stderr.on('data', (b) => {
        errLog += b.toString()
        onLog(b.toString())
      })

      child.on('close', (code) => {
        if (child.hasOwnProperty('error')) return

        if (code !== 0) {
          return onError(
            new Error(errLog))
        } else { // eslint-disable-line
          return onComplete()
        }
      })
    }
  })
}
