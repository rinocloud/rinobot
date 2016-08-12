import _package from './package'
import raven from 'raven'

export const createSentry = () => {
  const sentry = new raven.Client(
    'https://1ef48c3fe45247d487aabf4158dedf0d:aa76e34f867e4ce4b1df52b8b9d51136@app.getsentry.com/91878',
    {
      release: _package.version,
      environment: process.env.NODE_ENV
    }
  )

  sentry.patchGlobal()

  return sentry
}
