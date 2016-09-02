import { spawn } from 'child_process'
import _ from 'lodash'
import fs from 'fs-extra'
import swig from 'swig'
import pt from 'path'

const setUpScript = (pluginsDir, command, cb) => {
  let codePath = false

  fs.access(pt.join(pluginsDir, command), err => {
    if (err) {
      cb(new Error(`Cant find package "${command}"`), null)
    } else {
      const packagePath = pt.join(pluginsDir, command, 'package.json')
      fs.access(packagePath, err => { // eslint-disable-line
        if (err) {
          return cb(new Error(`Error reading package.json for plugin ${command}`), null)
        }
        return fs.readFile(packagePath, 'utf-8', (err, data) => { // eslint-disable-line
          if (err) return cb(new Error(`package.json in "${command}" could not be opened`), null)

          let packageJSON = {}
          try {
            packageJSON = JSON.parse(data)
          } catch (e) {
            return cb(new Error(`package.json in "${command}" could not be parsed`), null)
          }

          if (_.has(packageJSON, 'main')) {
            codePath = pt.join(pluginsDir, command, packageJSON.main)
            cb(null, codePath)
          } else {
            return cb(new Error(`package.json in "${command}" has no "main" specified`), null)
          }
        })
      })
    }
  })
}

export default (opts) => {
  const pluginsDir = opts.pluginsDir
  const command = opts.command
  const locals = opts.locals
  const cwd = opts.cwd

  const onError = opts.onError
  const onLog = opts.onLog
  const onComplete = opts.onComplete

  setUpScript(pluginsDir, command, (err, codePath) => {
    if (err) {
      onError(err)
    } else {
      const args = _.trim(swig.render(`${codePath} {{filepath}}`, { locals }))
      const magicDelimiter = ',,,xxx123'
      const tokens = _.map(args.split(/\\ /g).join(magicDelimiter).split(' '), (arg) =>
        arg.split(new RegExp(magicDelimiter, 'g')).join('\ ') // eslint-disable-line
      )

      const child = spawn('python', tokens, { cwd })

      child.on('error', (error) => {
        child.error = true
        return onError(error)
      })

      child.stdout.on('data', (b) => onLog(b.toString()))

      child.stderr.on('data', (b) => onLog(b.toString()))

      child.on('close', (code) => {
        if (child.hasOwnProperty('error')) return

        if (code !== 0) {
          return onError(
            new Error, null(
              `An error occured (code ${code}) while running "${codePath} ${args.split('  ')}"`))
        } else { // eslint-disable-line
          return onComplete()
        }
      })
    }
  })
}
