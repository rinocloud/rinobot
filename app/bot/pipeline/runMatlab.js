import { spawn } from 'child_process'
import pt from 'path'

export default (opts) => {
  const cwd = opts.cwd

  const filepath = opts.filepath
  const codePath = opts.codePath

  const onError = opts.onError
  const onLog = opts.onLog
  const onComplete = opts.onComplete

  const matlabCode = `try;filepath='${filepath}';run('${codePath}');catch e;disp(e.message);end;exit;quit;`

  const tokens = [
    '-nodisplay',
    '-nosplash',
    '-nodesktop',
    '-noFigureWindows',
    '-r',
    matlabCode
  ]

  const matlabPath = opts.root ?
    pt.join(opts.root, 'bin', 'matlab') : 'matlab'

  const child = spawn(matlabPath, tokens, { cwd })

  child.on('error', (error) => {
    child.error = true
    return onError(error)
  })

  child.stdout.on('data', (b) => onLog(b.toString()))

  child.stderr.on('data', (b) => onLog(b.toString()))

  child.on('close', (code) => {
    if (child.hasOwnProperty('error')) return

    onLog('[Rinbot]: Matlab has exited.')

    if (code !== 0) {
      return onError(
        new Error(
          `An error occured (code ${code}) while running "$MATLAB ${codePath}"`))
    } else { // eslint-disable-line
      return onComplete()
    }
  })
}
