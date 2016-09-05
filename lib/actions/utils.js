import fs from 'fs'
import pt from 'path'
import _ from 'lodash'
import yaml from 'js-yaml'
import rimraf from 'rimraf'
import constants from '../constants'


export const getConfig = (watchPath) => {
  /*
    Get the config file from the directory being watched
    returns null if the rino.yaml file doesnt exist
  */
  try {
    return yaml.safeLoad(fs.readFileSync(pt.join(watchPath, 'rino.yaml'), 'utf8'))
  } catch (e) {
    return null
  }
}


export const writeConfig = (path, _config, cb) => {
  let config = _.cloneDeep(_config)

  const metadata = {}
  _.each(config.metadata, o => {
    if (o.field && o.field !== '') {
      metadata[o.field] = o.value
    }
  })

  config.metadata = metadata

  if (_.isEmpty(config.metadata)) {
    config = _.omit(config, 'metadata')
  }

  window.mixpanel.track('Set config', {
    Commands: _.map(config.tasks, 'command'),
    Match: _.map(config.tasks, 'match'),
    Args: _.map(config.tasks, 'args'),
    Metadata: config.metadata,
  })

  fs.writeFile(
    pt.join(path, 'rino.yaml'),
    yaml.dump(config),
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
