import _ from 'lodash'
import fs from 'fs'
import pt from 'path'
import request from 'superagent'
import constants from '../constants'
import { createAction } from 'redux-actions'

/*
  Setup
*/

const initPackage = require('electron').remote.require('init-package-json')
const npmi = require('electron').remote.require('npmi')
const npm = require('electron').remote.require('npm')

let uninstaller
npm.load({
  loglevel: 'silent',
  save: true,
  force: true,
  progress: 'false'
}, () => {
  uninstaller = require('electron').remote.require('npm/lib/uninstall') // eslint-disable-line
})


/*
  Error
*/


export const setError = createAction('PLUGINS_SET_ERROR')


/*
  Registry - list of available plugins
*/


export const setRegistry = createAction('PLUGINS_SET_REGISTRY')


export const addPluginDetails = createAction('PLUGINS_ADD_PLUGIN_DETAILS')


export const toggleIsInstalling = createAction('PLUGINS_TOGGLE_IS_INSTALLING')


export const toggleIsSearching = createAction('PLUGINS_TOGGLE_IS_SEARCHING')


export const setPluginsConfig = createAction('PLUGINS_SET_CONFIG')


/*
  Fetch info from npm
*/


export const fetchRegistry = () => (dispatch) => {
  fs.exists(constants.registryCache, exists => {
    if (exists) {
      fs.readFile(constants.registryCache, (err, data) => {
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

      dispatch(toggleIsSearching())
      _.each(sorted, (plugin, index) => {
        dispatch(fetchDetails(plugin.name, index))
      })

      fs.writeFile(constants.registryCache, JSON.stringify(sorted, null, 2))
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
        const sorted = getState().plugins.registry
        fs.writeFile(constants.registryCache, JSON.stringify(sorted, null, 2))
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
    version: 'latest',
    path: constants.packagesPrefix,
    npmLoad: { save: true }
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


export const uninstall = (plugin, index) => (dispatch) => {
  dispatch(toggleIsInstalling(index))
  new uninstaller.Uninstaller(constants.packagesPrefix, false, [plugin.name])
    .run((err) => {
      if (err) dispatch(setError(err))
      else {
        dispatch(fetchConfig())
        dispatch(toggleIsInstalling(index))
      }
    })
}


export const update = (plugin, index) => (dispatch) => {
  dispatch(toggleIsInstalling(index))
  new uninstaller.Uninstaller(constants.packagesPrefix, false, [plugin.name])
    .run((err) => {
      if (err) dispatch(setError(err))
      else {
        dispatch(toggleIsInstalling(index))
        dispatch(install(plugin, index))
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
