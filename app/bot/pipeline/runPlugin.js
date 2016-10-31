import { spawn } from 'child_process'
import fs from 'fs-extra'
import _ from 'lodash'
import pt from 'path'
import { getPythonPath } from '../utils/pythonKernel'

const setUpScript = (pluginsDir, command, cb) => {
  let codePath = false
  const packagePath = pt.join(pluginsDir, command, 'package.json')
  fs.readFile(packagePath, 'utf-8', (err, data) => { // eslint-disable-line
    if (err) return cb(err, null)

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
}

export default (opts) => {
  /*
    runPlugin({
      pluginsDir: path to plugins directory,
      command: the plugin name,
      filepath: path to file,
      args: command args
      cwd: watched dir,
      onError: function(err){}
      onLog: function(log){}
      onComplete: function(){}
    })
  */

  const pluginsDir = opts.pluginsDir
  const command = opts.command
  const filepath = opts.filepath
  const args = opts.args
  const cwd = opts.cwd
  const prefix = opts.prefix || null
  const onError = opts.onError
  const onLog = opts.onLog
  const onComplete = opts.onComplete

  setUpScript(pluginsDir, command, (err, codePath) => {
    if (err) {
      onError(err)
    } else {
      let _args = [codePath, filepath]
      if (args) {
        _args = [..._args, ...args.split(' ')]
      }
      if (prefix) {
        _args = [..._args, `--prefix=${prefix}`]
      }

      getPythonPath((er, python) => {
        if (er) return onError(er)

        const child = spawn(python, _args, { cwd })

        child.on('error', (error) => {
          child.error = true
          return onError(error)
        })

        let errLog = ''
        child.stdout.on('data', (b) => onLog(b.toString()))
        child.stderr.on('data', (b) => {
          errLog += b.toString()
          onLog(b.toString())
        })

        child.on('close', (code) => {
          if (child.hasOwnProperty('error')) return

          if (code !== 0) {
            return onError(new Error(errLog))
          } else { // eslint-disable-line
            return onComplete()
          }
        })
      })
    }
  })
}
