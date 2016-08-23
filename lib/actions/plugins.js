import _ from 'lodash'
import fs from 'fs'
import pt from 'path'
import rimraf from 'rimraf'
import request from 'superagent'
import constants from '../constants'
import { createAction } from 'redux-actions'
const initPackage = require('electron').remote.require('init-package-json')
const npmi = require('electron').remote.require('npmi')

export const setError = createAction('PLUGINS_SET_ERROR')
export const setRegistry = createAction('PLUGINS_SET_REGISTRY')
export const addPluginDetails = createAction('PLUGINS_ADD_PLUGIN_DETAILS')
export const toggleIsInstalling = createAction('PLUGINS_TOGGLE_IS_INSTALLING')
export const toggleIsSearching = createAction('PLUGINS_TOGGLE_IS_SEARCHING')
export const setPluginsConfig = createAction('PLUGINS_SET_CONFIG')

/*
  Fetch info from npm
*/

export const fetchRegistry = () => (dispatch) => {
  fs.exists(constants.pluginRegistryCache, exists => {
    if (exists) {
      fs.readFile(constants.pluginRegistryCache, (err, data) => {
        if (!err) {
          const sorted = JSON.parse(data)
          dispatch(setRegistry(sorted))
        }
      })
    }
  })

  dispatch(toggleIsSearching())
  const url = 'https://registry.npmjs.org/-/_view/byKeyword?' +
  'startkey=[%22rinobot%22]' +
  '&endkey=[%22rinobot%22,%7B%7D]' +
  '&group_level=4'
  request
    .get(url)
    .end((err, res) => {
      if (err) {
        dispatch(setError('Could not fetch plugins'))
        window.Raven.captureException(err)
        return
      }

      const sorted = _.map(res.body.rows, el => ({
        name: el.key[1],
        description: el.key[2]
      }))

      // dispatch(setRegistry(sorted))
      dispatch(toggleIsSearching())
      _.each(sorted, (plugin, index) => {
        dispatch(fetchDetails(plugin.name, index))
      })

      fs.writeFile(constants.pluginRegistryCache, JSON.stringify(sorted, null, 2))
    })
}

export const fetchDetails = (packageName, index) => (dispatch, getState) => {
  const url = `https://registry.npmjs.org/${packageName}`
  request
    .get(url)
    .end((err, res) => {
      if (err) {
        dispatch(setError('Could not fetch plugin details'))
        window.Raven.captureException(err)
        return
      }
      dispatch(addPluginDetails({ index, details: res.body }))

      setTimeout(() => {
        const sorted = getState().plugins.pluginRegistry
        fs.writeFile(constants.pluginRegistryCache, JSON.stringify(sorted, null, 2))
      }, 400)
    })
}

/*
  Local packages
*/

export const initPackageJson = () => (dispatch) => {
  const initFile = pt.resolve('.npm-init')
  fs.exists(pt.join(constants.packagesPrefix, 'package.json'), exists => {
    if (!exists) {
      initPackage(constants.packagesPrefix, initFile, { force: true }, (err, data) => {
        if (err) {
          console.log(err)
          return dispatch(setError(err))
        }
        dispatch(setPluginsConfig(data))
      })
    } else {
      dispatch(fetchConfig())
    }
  })
}

export const fetchConfig = () => (dispatch) => {
  fs.readFile(pt.join(constants.packagesPrefix, 'package.json'), (err, data) => {
    if (err) {
      console.log(err)
      return dispatch(setError(err))
    }
    else { // eslint-disable-line
      dispatch(setPluginsConfig(JSON.parse(data)))
      dispatch(installDependancies())
    }
  })
}

export const install = (plugin, index) => (dispatch) => {
  dispatch(toggleIsInstalling(index))
  const options = {
    name: plugin.name,
    path: constants.packagesPrefix,
    npmLoad: {
      save: true,
      logLevel: 'silent'
    }
  }
  npmi(options, err => {
    if (err) {
      dispatch(setError('A plugin install error occurred, the error has been sent to our team.'))
      return window.Raven.captureException(err)
    } else { // eslint-disable-line
      dispatch(fetchConfig())
      dispatch(toggleIsInstalling(index))
    }
  })
}

export const uninstall = (plugin, index) => (dispatch, getState) => {
  dispatch(toggleIsInstalling(index))
  fs.exists(pt.join(constants.packagesDir, plugin.name), exists => {
    if (!exists) {
      dispatch(setError(`Cant remove plugin ${plugin.name}, not in packages directory.`))
    } else {
      const config = _.cloneDeep(getState().plugins.config)
      config.dependencies = _.omit(config.dependencies, plugin.name)
      dispatch(setPluginsConfig(config))
      dispatch(toggleIsInstalling(index))

      fs.writeFile(
        pt.join(constants.packagesPrefix, 'package.json'),
        JSON.stringify(config, null, 3),
          (err) => {
            if (err) dispatch(setError(err))
            else {
              rimraf(pt.join(constants.packagesDir, plugin.name), err => {
                if (err) dispatch(setError(err))
              })
            }
          })
    }
  })
}

export const installDependancies = () => (dispatch) => {
  npmi({
    path: constants.packagesPrefix
  }, err => {
    if (err) {
      console.log(err)
      return dispatch(setError(err))
    }
  })
}
