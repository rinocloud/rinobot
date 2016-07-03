
import fs from 'fs'
import tar from 'tar'
import pt from 'path'
import zlib from 'zlib'
import rimraf from 'rimraf'
import request from 'superagent'
import constants from '../constants'
import { createAction } from 'redux-actions'

export const toggleIsSearching = createAction('PLUGINS_TOGGLE_IS_SEARCHING')
export const toggleIsInstalling = createAction('PLUGINS_TOGGLE_IS_INSTALLING')
export const setResults = createAction('PLUGINS_SET_RESULTS')
export const setError = createAction('PLUGINS_SET_ERROR')
export const installedPackage = createAction('PLUGIN_INSTALLED_PACKAGE')
export const removePackage = createAction('PLUGIN_REMOVE_PACKAGE')

export const readLocalPlugins = () => {
  return (dispatch, getState) => {
    try{
      const pluginsJSON = JSON.parse(fs.readFileSync(constants.packagesFilePath, 'utf-8'))
      dispatch(setResults({
        items: pluginsJSON,
        total_count: pluginsJSON.length
      }))
    }catch(err){
      if(err.code != 'ENOENT') throw err
    }
  }
}

export const persistPlugins = (action) => {
  return (dispatch, getState) => {
    const str = JSON.stringify(getState().plugins.results)
    fs.writeFile(constants.packagesFilePath, str, 'utf-8', function(err){
      if (err) dispatch(setError(err.message))
    })
  }
}

export const clearPersistantPlugins = (action) => {
  return (dispatch, getState) => {
    fs.unlink(constants.packagesFilePath, function(err){
      if (err) dispatch(setError(err.message))
    })
  }
}

export const doSearch = (action) => {
  return (dispatch, getState) => {
    dispatch(toggleIsSearching())
    const apiUrl = 'https://api.github.com/search/repositories?q='
    const query = `rinobot+in:name,description+${action}+in:name,description`

    request
      .get(apiUrl + query)
      .end((err, res)=>{
        dispatch(toggleIsSearching())
        if (err) return dispatch(setError(err.message))
        dispatch(setResults(res.body))
      })
  }
}

export const downloadPackage = (plugin, index) => {
  return (dispatch, getState) => {
    dispatch(toggleIsInstalling(index))
    const tarballUrl = plugin.archive_url.replace('{archive_format}', 'tarball').replace('{/ref}', '/master')
    const dest = pt.join(constants.packagesDir, plugin.name)

    request.get(tarballUrl)
      .then(function(res){
        res
          .pipe(zlib.Unzip())
          .pipe( tar.Extract( { path: dest, strip:1 } ) )
          .on( "end", function() {
            dispatch(installedPackage(index))
            dispatch(toggleIsInstalling(index))
            dispatch(persistPlugins())
          })
          .on( "error", function( e ) {
            console.log( e )
          })
      })
  }
}

export const uninstallPackage = (plugin, index) => {
  return (dispatch, getState) => {
    const dest = pt.join(constants.packagesDir, plugin.name)
    rimraf(dest, function(err){
      if (err) return  dispatch(setError(err.message))
      dispatch(removePackage(index))
      dispatch(persistPlugins())
    })
  }
}
