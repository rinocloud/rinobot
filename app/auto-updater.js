const { autoUpdater } = require('electron')
const { version } = require('./package')
const ms = require('ms')

// accepted values: `osx`, `win32`
// https://nuts.gitbook.com/update-windows.html
const platform = 'darwin' === process.platform ? 'osx' : process.platform // eslint-disable-line
const FEED_URL = `https://updates.rinocloud.com/update/${platform}`
let isInit = false

function init(rpc) {
  rpc.emit('log', 'in init')
  autoUpdater.on('error', (err, msg) => {
    rpc.emit('unexpected error', `Error fetching updates: ${msg} (${err.stack})`)
    rpc.emit('log', `Error fetching updates: ${msg} (${err.stack})`)
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
  if (!isInit) init(rpc)

  const onupdate = (ev, releaseNotes, releaseName) => {
    rpc.emit('log', { releaseNotes, releaseName })
    rpc.emit('update available', { releaseNotes, releaseName })
  }

  autoUpdater.on('update-downloaded', onupdate)

  autoUpdater.on('update-not-available', () => {
    rpc.emit('log', 'update-not-available')
  })

  autoUpdater.on('checking-for-update', () => {
    rpc.emit('log', 'checking-for-update')
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
