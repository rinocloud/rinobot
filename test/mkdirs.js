/* eslint-disable */

var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var _ = require('lodash')
var fs = require('fs-extra')
var pt = require('path')

var maxDepth = 5
try {
 maxDepth = parseInt(process.argv[2])
} catch (e) {}

var currentDepth = 1
var baseDir = pt.join(__dirname, 'test-fixtures')

var makeFiles = function(index = 1){
  if (currentDepth > maxDepth) return
  var n = _.reduce(_.range(1, index + 1), function(i, j){
    return pt.join(i.toString(), j.toString()).toString()
  }, '')

  var newDir = pt.join(baseDir, n)

  mkdirp.sync(newDir)
  _.each(_.range(1, maxDepth + 1), function(i){
    var fileName = pt.join(newDir, `test${i}.txt`)
    fs.writeFileSync(fileName, '123')
  })

  currentDepth ++
  makeFiles(index + 1)
}

rimraf(pt.join(baseDir, '1'), function(err){
  if (err) throw err
  rimraf(pt.join(baseDir, '.rino'), function(err){
    if (err) throw err
    makeFiles()
  })
})

var config = `
tasks:
  - match: "*"
    command: "echo"
    args: "{{filepath}}"
`

fs.writeFileSync(pt.join(baseDir, 'rino.yaml'), config, 'utf-8')

console.log(`Mapped ${maxDepth} deep`)
