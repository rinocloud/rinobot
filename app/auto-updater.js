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

function init () {
  autoUpdater.on('error', (err, msg) => {
    console.error('Error fetching updates', msg + ' (' + err.stack + ')')
  })

  autoUpdater.setFeedURL(`${FEED_URL}/${version}`)

  setTimeout(() => {
    autoUpdater.checkForUpdates()
  }, ms('10s'))

  setInterval(() => {
    autoUpdater.checkForUpdates()
  }, ms('5m'))

  isInit = true
}

module.exports = function (win, rpc) {
  if (!isInit) init()

  const onupdate = (ev, releaseNotes, releaseName) => {
    rpc.emit('update available', { releaseNotes, releaseName })
  }

  autoUpdater.on('update-downloaded', onupdate)

  rpc.once('quit and install', () => {
    autoUpdater.quitAndInstall()
  })

  win.on('close', () => {
    autoUpdater.removeListener('update-downloaded', onupdate)
  })
}
