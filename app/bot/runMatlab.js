import { spawn } from 'child_process'

export default (opts) => {
  const codePath = opts.codePath
  const cwd = opts.cwd

  const filepath = opts.filepath
  const args = opts.args

  const onError = opts.onError
  const onLog = opts.onLog
  const onComplete = opts.onComplete

  const template = "filepath='{{filepath}}';run('{{script}}');;exit;"
  const matlabCode = template
                      .replace('{{filepath}}', filepath)
                      .replace('{{script}}', args)

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
          `An error occured (code ${code}) while running "$MATLAB ${args.split('  ')}"`))
    } else { // eslint-disable-line
      return onComplete()
    }
  })
}
