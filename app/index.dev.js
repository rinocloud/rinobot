import { app } from 'electron'
import { createSentry } from './analytics'
import createWindow from './window'
const isOSX = process.platform === 'darwin'

const main = () => {
  if (require('electron-squirrel-startup')) return // eslint-disable-line

  createSentry()

  app.setName('rinobot')
  app.on('window-all-closed', () => { if (!isOSX) app.quit() })
  app.on('ready', () => { createWindow(app) })
  if (isOSX) app.dock.show()
}

main()
