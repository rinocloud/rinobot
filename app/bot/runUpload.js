import pt from 'path'
import fetchMetadata from './fetchMetadata'
import * as api from '../api/api'

export default (opts) => {
  const apiToken = opts.apiToken
  const args = opts.args
  const filepath = opts.filepath
  const relativePath = opts.relativePath
  const onError = opts.onError
  const onLog = opts.onLog
  const onComplete = opts.onComplete

  const nixPath = pt.join(args, relativePath).replace(/\\/g, '/')

  fetchMetadata(filepath, (err, metadata) => {
    if (err) {
      return onError(err)
    }

    const m = metadata || {}
    m.name = `${nixPath}`

    api.auth(apiToken)
    api.setBase('https://rinocloud.com')

    onLog('Starting upload')

    const onProgress = (total, loaded) => {
      const percent = (loaded / total) * 100
      onLog(`Upload progress ${percent.toFixed(2)}%`)
    }

    return api.s3uploadElectron(
        filepath,
        m,
        onProgress,
        onError,
        onComplete)
  })
}
