const { autoUpdater } = require('electron')
const { version } = require('./package')
const ms = require('ms')

// accepted values: `osx`, `win32`
// https://nuts.gitbook.com/update-windows.html
const platform = 'darwin' === process.platform
  ? 'osx'
  : process.platform
const FEED_URL = `https://updates.rinocloud.com/update/${platform}`
let isInit = false

function init (rpc) {

  rpc.emit('log', 'in init')
  autoUpdater.on('error', (err, msg) => {
    rpc.emit('error', 'Error fetching updates: ' + msg + ' (' + err.stack + ')')
    rpc.emit('log', 'Error fetching updates: ' + msg + ' (' + err.stack + ')')
  })

  rpc.emit('log', 'setting feed url')
  autoUpdater.setFeedURL(`${FEED_URL}/${version}`)

  setTimeout(() => {
    rpc.emit('log', 'checkForUpdates')
    autoUpdater.checkForUpdates()
  }, ms('10s'))

  setInterval(() => {
    rpc.emit('log', 'checkForUpdates')
    autoUpdater.checkForUpdates()
  }, ms('5m'))

  rpc.emit('log', 'finished run through init')
  isInit = true
}

module.exports = function (win, rpc) {
  rpc.emit('log', 'in auto-updater')
  if (!isInit) init(rpc)

  const onupdate = (ev, releaseNotes, releaseName) => {
    rpc.emit('log', { releaseNotes, releaseName })
    rpc.emit('update available', { releaseNotes, releaseName })
  }

  autoUpdater.on('update-downloaded', onupdate)

  autoUpdater.on('update-not-available', args => {
    rpc.emit('log', `update-not-available ${args}`)
  })

  autoUpdater.on('checking-for-update', args => {
    rpc.emit('log', `checking-for-update ${args}`)
  })

  autoUpdater.on('update-available', args => {
    rpc.emit('log', `update-available ${args}`)
  })

  rpc.once('quit and install', () => {
    rpc.emit('log', 'quit and install')
    autoUpdater.quitAndInstall()
  })

  win.on('close', () => {
    autoUpdater.removeListener('update-downloaded', onupdate)
  })
}
