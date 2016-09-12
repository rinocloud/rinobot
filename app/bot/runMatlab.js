import { spawn } from 'child_process'

export default (opts) => {
  const cwd = opts.cwd

  const filepath = opts.filepath
  const codePath = opts.codePath

  const onError = opts.onError
  const onLog = opts.onLog
  const onComplete = opts.onComplete

  const matlabCode = `filepath='${filepath}';run('${codePath}');exit;`

  const tokens = [
    '-nodisplay',
    '-nosplash',
    '-nodesktop',
    '-r',
    matlabCode
  ]

  const child = spawn('matlab', tokens, { cwd })

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
          `An error occured (code ${code}) while running "$MATLAB ${codePath}"`))
    } else { // eslint-disable-line
      return onComplete()
    }
  })
}
