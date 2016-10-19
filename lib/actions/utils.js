import fs from 'fs'
import pt from 'path'
import _ from 'lodash'
import yaml from 'js-yaml'
import rimraf from 'rimraf'
import constants from '../constants'
import update from 'react-addons-update'


export const getConfig = (watchPath) => {
  /*
    Get the config file from the directory being watched
    returns null if the rino.yaml file doesnt exist

    if the config is from rino.yaml v1 -> then we automatically convert
    it to rino.yaml v2 before returning it, and overwriting the file.
  */
  try {
    let config = yaml.safeLoad(fs.readFileSync(pt.join(watchPath, 'rino.yaml'), 'utf8'))

    if (_.has(config, 'tasks')) {
      /*
        This piece is for backwards compatibility with the old rino.yaml files.
      */
      const pipelines = _.map(config.tasks, ({ command, args, match }) => ({
        filematch: match,
        tasks: [
          {
            name: command,
            args
          }
        ]
      }))

      config = _.omit(config, 'tasks')
      config.pipelines = pipelines

      writeConfig(watchPath, config)
    }

    return config
  } catch (e) {
    return null
  }
}


const mapArgObjectToString = (obj) => {
  const str = _.reduce(obj, (result, value, key) => {
    if (key === 'default') {
      result = value // eslint-disable-line
    } else {
      result = `--${key}=${value} ${result}` // eslint-disable-line
    }
    return result
  }, '')
  return str
}

const mapTaskArgsToString = (tasks = []) =>
  _.map(tasks, task => {
    const _task = _.clone(task)
    if (task.args && _.isObject(task.args)) {
      _task.args = mapArgObjectToString(task.args)
    }
    return _task
  })


export const writeConfig = (path, config, cb) => {
  let _config = _.cloneDeep(config)

  const metadata = {}
  _.each(_config.metadata, o => {
    if (o.field && o.field !== '') {
      metadata[o.field] = o.value
    }
  })

  _config.metadata = metadata

  if (_.isEmpty(_config.metadata)) {
    _config = _.omit(_config, 'metadata')
  }

  _config.pipelines = _.map(config.pipelines, (pipeline) => {
    return update(pipeline, {
      tasks: {
        $apply: mapTaskArgsToString
      }
    })
  })

  fs.writeFile(
    pt.join(path, 'rino.yaml'),
    yaml.dump(_config),
    'utf-8',
    cb
  )
}


export const rmDotRino = (path, cb) => {
  rimraf(`${path}/.rino/`, cb)
}


export const writeDirs = (dirs, cb) => {
  const data = _.map(dirs, o => _.omit(o, 'config'))
  const str = JSON.stringify(data, null, 3)
  fs.writeFile(constants.watcherFilePath, str, 'utf-8', cb)
}


export const readDirs = (cb) => {
  fs.readFile(constants.watcherFilePath, (err, data) => {
    if (err && err.code === 'ENOENT') cb(null, null)
    else if (err) cb(err, null)
    else cb(null, JSON.parse(data))
  })
}


export const writeAuth = (auth, cb) => {
  fs.writeFile(constants.authFilePath, JSON.stringify(auth), 'utf-8', cb)
}


export const readAuth = (cb) => {
  try {
    const authJSON = JSON.parse(fs.readFileSync(constants.authFilePath, 'utf-8'))
    cb(null, authJSON)
  } catch (err) {
    if (err.code !== 'ENOENT') cb(err, null)
    else cb(null, null)
  }
}


export const rmAuth = (cb) => {
  fs.unlink(constants.authFilePath, cb)
}
