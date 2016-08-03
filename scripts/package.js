const os = require('os')
const packager = require('electron-packager')
const exec = require('child_process').exec
const argv = require('minimist')(process.argv.slice(2))
const pkg = require('../package.json')
const deps = Object.keys(pkg.dependencies)
const devDeps = Object.keys(pkg.devDependencies)
const shouldBuildAll = argv.all || false

const DEFAULT_OPTS = {
  dir: './',
  name: pkg.productName,
  asar: false,
  ignore: [
    '^/test($|/)',
    '^/tools($|/)',
    '^/release($|/)',
    '^/app/node_modules($|/)',
    '^/main($|/)',
    '^/index.development.js'
  ]
  .concat(devDeps.map(name => `/node_modules/${name}($|/)`))
  .concat(deps
    .filter(name => !['font-awesome', 'source-map-support'].includes(name))
    .map(name => `/node_modules/${name}($|/)`))
}

const icon = argv.icon || argv.i || 'app/app'

if (icon) {
  DEFAULT_OPTS.icon = icon
}

const version = argv.version || argv.v

if (version) {
  DEFAULT_OPTS.version = version
  startPack()
} else {
  // use the same version as the currently-installed electron-prebuilt
  exec('npm list electron-prebuilt --dev', (err, stdout) => {
    if (err) {
      DEFAULT_OPTS.version = '1.2.0'
    } else {
      DEFAULT_OPTS.version = stdout.split('electron-prebuilt@')[1].replace(/\s/g, '')
    }
    startPack()
  })
}

function startPack() {
  console.log('start pack...')
  if (shouldBuildAll) {
    // build for all platforms
    const archs = ['ia32', 'x64']
    const platforms = ['win32', 'darwin']

    platforms.forEach(plat => {
      archs.forEach(arch => {
        pack(plat, arch, log(plat, arch))
      })
    })
  } else {
    // build for current platform only
    pack(os.platform(), os.arch(), log(os.platform(), os.arch()))
  }
}

function pack(plat, arch, cb) {
  // there is no darwin ia32 electron
  if (plat === 'darwin' && arch === 'ia32') return

  const iconObj = {
    icon: DEFAULT_OPTS.icon + (() => {
      let extension = '.png'
      if (plat === 'darwin') {
        extension = '.icns'
      } else if (plat === 'win32') {
        extension = '.ico'
      }
      return extension
    })()
  }

  const opts = Object.assign({}, DEFAULT_OPTS, iconObj, {
    platform: plat,
    arch,
    prune: true,
    'app-version': pkg.version || DEFAULT_OPTS.version,
    out: `release/${plat}-${arch}`
  })

  packager(opts, cb)
}


function log(plat, arch) {
  return (err) => {
    if (err) return console.error(err)
    console.log(`${plat}-${arch} finished!`)
  }
}
