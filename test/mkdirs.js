/* eslint-disable */

var mkdirp = require('mkdirp')
var _ = require('lodash')
var fs = require('fs-extra')
var pt = require('path')

var maxDepth = 10
var currentDepth = 1
var baseDir = pt.join(__dirname, 'test-fixtures')

var makeFiles = function(index = 1){
  if (currentDepth >= maxDepth) return
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

makeFiles()

var config = `
tasks:
  - match: "*"
    command: "echo"
    args: "{{filepath}}"
`

fs.writeFileSync(pt.join(baseDir, 'rino.yaml'), config, 'utf-8')
