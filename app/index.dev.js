
import { app } from 'electron'
import { createSentry } from './analytics'
import createWindow from './window'
const isOSX = process.platform === 'darwin'

const main = () => {
  if (require('electron-squirrel-startup')) return // eslint-disable-line

  const sentry = createSentry()

  app.setName('rinobot')
  app.on('window-all-closed', () => { if (!isOSX) app.quit() })
  app.on('ready', () => { createWindow(app, sentry) })
  if (isOSX) app.dock.show()
}

main()
