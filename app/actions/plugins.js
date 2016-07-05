
import fs from 'fs'
import tar from 'tar'
import pt from 'path'
import zlib from 'zlib'
import rimraf from 'rimraf'
import request from 'superagent'
import constants from '../constants'
import { createAction } from 'redux-actions'
import { push } from 'react-router-redux'

export const toggleInstalled = createAction('PLUGIN_TOGGLE_IS_INSTALLED')
export const toggleIsInstalling = createAction('PLUGINS_TOGGLE_IS_INSTALLING')
export const toggleIsSearching = createAction('PLUGINS_TOGGLE_IS_SEARCHING')
export const setSearchResults = createAction('PLUGINS_SET_SEARCH_RESULTS')
export const setError = createAction('PLUGINS_SET_ERROR')
export const removeInstalledPackage = createAction('PLUGIN_REMOVE_INSTALLED_PACKAGE')
export const addInstalledPackages = createAction('PLUGIN_ADD_INSTALLED_PACKAGE')
export const setInstalledPackages = createAction('PLUGIN_SET_INSTALLED_PACKAGE')

export const readLocalPlugins = () => (dispatch) => {
  let pluginsJSON = null
  try {
    pluginsJSON = JSON.parse(fs.readFileSync(constants.packagesFilePath))
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }
  if (pluginsJSON) dispatch(setInstalledPackages(pluginsJSON))
}

export const persistPlugins = () => (dispatch, getState) => {
  const str = JSON.stringify(getState().plugins.installedPackages, null, 3)
  fs.writeFile(constants.packagesFilePath, str, 'utf-8', (err) => {
    if (err) dispatch(setError(err.message))
  })
}

export const clearPersistantPlugins = () => (dispatch) => {
  fs.unlink(constants.packagesFilePath, (err) => {
    if (err) dispatch(setError(err.message))
  })
}

export const downloadPackage = (plugin, index) => (dispatch) => {
  dispatch(toggleIsInstalling(index))
  let tarballUrl = plugin.archive_url
  tarballUrl = tarballUrl.replace('{archive_format}', 'tarball').replace('{/ref}', '/master')
  const dest = pt.join(constants.packagesDir, plugin.name)

  request.get(tarballUrl)
    .then((res) => {
      res
        .pipe(zlib.Unzip())
        .pipe(tar.Extract({ path: dest, strip: 1 }))
        .on('end', () => {
          dispatch(toggleInstalled(index))
          dispatch(toggleIsInstalling(index))
          dispatch(addInstalledPackages([{
            ...plugin,
            isInstalled: true
          }]))
          dispatch(persistPlugins())
        })
        .on('error', (err) => {
          throw err
        })
    })
}

export const installLocalPackage = (path) => (dispatch) => {
  dispatch(addInstalledPackages([{ name: path }]))
  dispatch(persistPlugins())
  setTimeout(() => dispatch(push('/installed_plugins')), 100)
}

export const uninstallPackage = (plugin, index) => (dispatch) => {
  const dest = pt.join(constants.packagesDir, plugin.name)
  rimraf(dest, (err) => {
    if (err) return dispatch(setError(err.message))
    dispatch(removeInstalledPackage(index))
    dispatch(persistPlugins())
  })
}


export const doSearch = (action) => (dispatch) => {
  dispatch(toggleIsSearching())
  const apiUrl = 'https://api.github.com/search/repositories?q='
  const query = `rinobot+in:name,description+${action}+in:name,description`

  request
    .get(apiUrl + query)
    .end((err, res) => {
      dispatch(toggleIsSearching())
      if (err) return dispatch(setError(err.message))
      dispatch(setSearchResults(res.body))
    })
}
