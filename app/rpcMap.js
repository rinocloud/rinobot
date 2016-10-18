
export const JSONError = function (error) {
  this.name = error.name || ''
  this.message = error.message || ''
  this.stack = error.stack || ''
  if (error.code) this.code = error.code
  if (error.errno) this.errno = error.errno || ''
  if (error.syscall) this.syscall = error.syscall || ''
  if (error.path) this.path = error.path || ''
}

JSONError.prototype = Error.prototype;


export default (rpc, forkRpc, sentry) => {
  rpc.on('watch', args => forkRpc.emit('watch', args))
  rpc.on('unwatch', args => forkRpc.emit('unwatch', args))
  rpc.on('unwatch all', args => forkRpc.emit('unwatch all', args))

  forkRpc.on('ready', () => rpc.emit('child process ready'))

  forkRpc.on('watcher ready', args => rpc.emit('watcher ready', args))
  forkRpc.on('watcher started', args => rpc.emit('watcher started', args))
  forkRpc.on('watcher set total files', args => rpc.emit('watcher set total files', args))
  forkRpc.on('watcher set processed files', args => rpc.emit('watcher set processed files', args))

  forkRpc.on('set history', args => rpc.emit('set history', args))
  forkRpc.on('task started', args => rpc.emit('task started', args))
  forkRpc.on('task log', args => rpc.emit('task log', args))
  forkRpc.on('task complete', args => rpc.emit('task complete', args))
  forkRpc.on('task error', args => {
    console.log('task error')
    sentry.captureException(new JSONError(args.error))
    rpc.emit('task error', args)
  })
  forkRpc.on('task ignore', args => rpc.emit('task ignore', args))

  forkRpc.on('unexpected error', error => {
    rpc.emit('unexpected error', error)
    sentry.captureException(new JSONError(error))
  })
}
