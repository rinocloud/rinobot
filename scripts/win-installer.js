const electronInstaller = require('electron-winstaller')

const resultPromise = electronInstaller.createWindowsInstaller({
  appDirectory: 'release/win32-x64/rinobot-win32-x64',
  outputDirectory: 'release/rinobot-win',
  authors: 'Rinocloud.',
  exe: 'rinobot.exe'
})

resultPromise
  .then(
    () => console.log('It worked!'),
    (e) => console.log(`No dice: ${e.message}`)
)
