import _ from 'lodash'


export const setupServices = () => {
  const isDev = process.env.NODE_ENV === 'development'

  window.mixpanel.init('ca24b54ea8a47247e80440d709622be3')
  if (!isDev) {
    window.Raven.config(
      'https://140838b87a124da883424d7935b61743@app.getsentry.com/91879',
      {
        environment: process.env.NODE_ENV,
        release: window.rinobotVersion
      }
    ).install()

    window.mixpanel.register({
      environment: process.env.NODE_ENV,
      release: window.rinobotVersion
    })
  } else {
    window.Raven = {
      captureException: (e) => console.error(e),
      setUserContext: _.noop,
      setExtraContext: _.noop
    }
    window.mixpanel.disable()
  }
}


export const assignUser = (user) => {
  if (window.Raven) {
    window.Raven.setUserContext({
      email: user.email,
      project: user.project,
      projectId: user.projectId || null,
      username: user.username,
      userId: user.userId || null,
    })

    window.mixpanel.identify(user.userId)
    window.mixpanel.people.set({
      $email: user.email,
      $name: user.email,
      'Project Name': user.project,
      'Project ID': user.projectId || null,
      Username: user.username,
      'User ID': user.userId || null,
    })

    window.mixpanel.track('Login')

    window.Intercom('boot', { // eslint-disable-line
      app_id: 'z80lonlq',
      name: user.username,
      email: user.email,
      created_at: Date.now(),
      project: user.project,
      projectId: user.projectId || null,
      userId: user.userId || null,
      widget: {
        activator: '#IntercomDefaultWidget'
      }
    })
  }
}


export const unassignUser = () => {
  if (window.Raven) window.Raven.setUserContext()
  window.Intercom('shutdown') // eslint-disable-line
}
