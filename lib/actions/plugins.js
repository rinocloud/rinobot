import _ from 'lodash'
import asyncMap from 'async/map'
import fs from 'fs'
import pt from 'path'
import request from 'superagent'
import constants from '../constants'
import { createAction } from 'redux-actions'
import Raven from 'raven-js'
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


export const setInstalledPlugins = createAction('PLUGINS_SET_INSTALLED')


/*
  Fetch info from npm
*/


export const fetchRegistry = () => (dispatch) => {
  dispatch(toggleIsSearching())
  const url =
    'http://plugins.rinocloud.com/plugin-list.json'

  request
    .get(url)
    .type('json')
    .end((err, res) => {
      if (err) {
        dispatch(setError('Could not fetch plugins'))
        Raven.captureException(err)
        return
      }

      const p = _.map(res.body.aaData, r => ({
        name: r.name,
        version: r.version,
        description: r.description,
        author: r.author,
        modified: r.modified,
        downloads: r.dl
      }))

      dispatch(setRegistry(p))
      dispatch(toggleIsSearching())
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
        dispatch(setInstalledPlugins(data))
      })
    } else {
      dispatch(fetchInstalled())
    }
  })
}


export const fetchInstalled = () => (dispatch) => {
  fs.readFile(pt.join(constants.packagesPrefix, 'package.json'), (err, data) => {
    if (err) {
      return dispatch(setError(err))
    }

    const packageDirs = _.map(_.keys(JSON.parse(data).dependencies), pkgName =>
      pt.join(constants.packagesPrefix, 'node_modules', pkgName, 'package.json')
    )

    asyncMap(packageDirs, fs.readFile, (err, resultStrs) => {
      const packages = _.map(resultStrs, JSON.parse)
      dispatch(setInstalledPlugins(packages))
      dispatch(installDependancies())
    })
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
      return Raven.captureException(err)
    } else { // eslint-disable-line
      dispatch(fetchInstalled())
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
        dispatch(fetchInstalled())
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
      return dispatch(setError(err))
    }
  })
}
