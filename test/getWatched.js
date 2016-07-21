/* eslint-disable */

var c = require('chokidar')
var _ = require('lodash')
var pt = require('path')

var count = function(_watched){
  var numFiles = _.reduce(_watched, function(result, relPaths, basePath){
    var f =_.reduce(value, function(res, relPath, k){
      return _watched.hasOwnProperty(pt.join(key, relPath)) ? res + 1 : res + 0
    }, 0)
    return result + value.length - f
  }, 0)

  // subtract 1 because chokidar adds the parent dir too
  return numFiles - 1
}

var dir = pt.join(__dirname)

var a0 = new Date()
var w = c.watch(dir, {
  ignored: ['**.rino**', '**.rino/**', '**.rino', '**/.rino', '/[\/\\]\./'],
})

w.on('ready', function(){
  var t0 = new Date()
  var numFolders = _.keys(w.getWatched()).length - 1
  console.log(`Indexed ${numFolders} folders in ${t0-a0} ms.`)
  var numFiles = count(w.getWatched())
  var t1 = new Date()
  var delta = t1 - t0
  console.log(`Counted ${numFiles} files in ${delta} ms.`)
  process.exit(1)
})
