import mixpanel from 'mixpanel-browser'
import moment from 'moment'
import Raven from 'raven-js'

export const setupAnalytics = () => {
  const isDev = false // process.env.NODE_ENV === 'development'

  mixpanel.init('bdbeaa5e3c02433467d4588274af01d7')
  if (!isDev) {
    Raven.config(
      'https://140838b87a124da883424d7935b61743@sentry.io/91879',
      {
        environment: process.env.NODE_ENV,
        release: window.rinobotVersion
      }
    ).install()

    mixpanel.register({
      environment: process.env.NODE_ENV,
      release: window.rinobotVersion
    })
  } else {
    mixpanel.disable()
  }
}


export const assignUser = (user) => {
  Raven.setUserContext({
    email: user.email,
    project: user.project,
    projectId: user.projectId || null,
    username: user.username,
    userId: user.userId || null,
  })

  mixpanel.identify(user.userId)
  mixpanel.people.set({
    $email: user.email,
    $name: user.email,
    'Project Name': user.project,
    'Project ID': user.projectId || null,
    Username: user.username,
    'User ID': user.userId || null,
  })

  mixpanel.track('Login')

  window.Intercom('boot', { // eslint-disable-line
    app_id: 'z80lonlq',
    name: user.username,
    email: user.email,
    created_at: moment(user.created_at).unix(),
    project: user.project,
    rino_app: 'rinobot',
    projectId: user.projectId || null,
    userId: user.userId || null,
    widget: {
      activator: '#IntercomDefaultWidget'
    }
  })
}


export const unassignUser = () => {
  Raven.setUserContext()
  window.Intercom('shutdown') // eslint-disable-line
}
