import fs from 'fs'
import pt from 'path'
import _ from 'lodash'
import yaml from 'js-yaml'
import rimraf from 'rimraf'
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


export const saveableConfig = (config) => {
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

  return _config
}

export const writeConfig = (path, config, cb) => {
  fs.writeFile(
    pt.join(path, 'rino.yaml'),
    yaml.dump(saveableConfig(config)),
    'utf-8',
    cb
  )
}


export const rmDotRino = (path, cb) => {
  rimraf(`${path}/.rino/`, cb)
}


export const snippetTemplate = (snippetName) => `
import rinobot_plugin as bot
import numpy as np
import matplotlib.pyplot as plt

def main():
    # here we get the filepath
    filepath = bot.filepath()
    # and load the data
    data = bot.loadfile(filepath)
    # here is the output path if you want to save
    # the processed data
    outname = bot.no_extension() + '-${snippetName}.txt'
    outpath = bot.output_filepath(outname)

    # your code goes here


if __name__ == "__main__":
    main()
`
