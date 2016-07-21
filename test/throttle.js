/* eslint-disable */

var c = require('chokidar')
var _ = require('lodash')
var pt = require('path')
var dir = pt.join(__dirname, 'test-fixtures')

var flattenWatched = function(watched){
  return _.flatten(
    _.map(watched, function(relPaths, basePath){
      return _.reduce(relPaths, function(arr, relPath){
        var d = pt.join(basePath, relPath)
        if (!watched.hasOwnProperty(d)){
          arr.push(d)
        }
        return arr
      }, [])
    })
  )
}

var processedFiles = []

var processFile = function(path, watchDir, event){
  console.log(`New path ${path}, ${watchDir}, ${event}`)
}

var done = function(watcher, watchDir, event){
  return function(){
    var newFiles = _.map(flattenWatched(watcher.getWatched()), function(file){
      if (!processedFiles.includes(file)) {
        processFile(file, watchDir, event)
        processedFiles.push(file)
      }
    })
  }
}

var timer;
var handler = function(watcher, watchDir, event){
  clearTimeout(timer)
  timer = setTimeout(done(watcher, watchDir, event), 200);
}

var w;
w = c
  .watch(dir, {
    ignored: ['**.rino**', '**.rino/**', '**.rino', '**/.rino', '/[\/\\]\./'],
  })
  .on('add', function(){ handler(this, dir, 'add') })


/*
const queuePipeline = (watchPath, index, watcher) => { // eslint-disable-line
  return (eventPath) => {
    const pipeline = new Pipeline({
      watchPath,
      path: eventPath,
      on_complete: pipelineComplete.bind(null, index),
      on_log: pipelineLog.bind(null, index),
      on_error: pipelineError.bind(null, index),
    })

    if (!pipeline.ignored) {
      pipelineStarted(index)
      pipeline.run()
    }
  }
}
*/
