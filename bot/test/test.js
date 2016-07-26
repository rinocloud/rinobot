'use strict'

var chokidar = require('chokidar')
var rinobot = require('../src/index')

var chai = require('chai')
var expect = chai.expect
var should = chai.should()
var sinon = require('sinon')
var rimraf = require('rimraf')
var fs = require('fs-extra')
var sysPath = require('path')
var pt = require('path')
var yaml = require('js-yaml')
var api = require('rinocloud-javascript')
chai.use(require('sinon-chai'))
var os = process.platform

var blockDelta = 1;
var interval = 500;
var interval = setInterval(function() {
    var last = process.hrtime();          // replace Date.now()
    setImmediate(function() {
        var delta = process.hrtime(last); // with process.hrtime()
        if (delta > blockDelta) {
            report("node.eventloop_blocked", delta);
        }
    });
}, interval);

function getFixturePath (subPath) {
  return sysPath.join(
    __dirname,
    'test-fixtures',
    subdir && subdir.toString() || '',
    subPath
  )
}

function existsSync(filename){
  if(!filename) return false
  try {
    fs.accessSync(filename);
    return true;
  } catch(ex) {
    return false;
  }
}

function copy(name, o){
  /* copies from the template directory to the test directory */
  const i = pt.join(templatesDir, name)
  fs.copySync(i, o)
}


var defaultOnComplete = function(pipe){console.log(`\t\t${pipe.relPath} complete`)}
var defaultOnLog = function(pipe, msg){console.log(`\t\t${pipe.relPath} ${msg}`)}
var defaultOnError = function(pipe, err){console.log(`\t\t${pipe.relPath} ${err.message}`)}
var defaultOnIgnore = function(pipe, msg){console.log(`\t\t${pipe.relPath} ignored: ${msg}`)}

var watcher,
    usedWatchers = [],
    fixturesPath = getFixturePath(''),
    subdir = 0,
    options,
    node010 = process.version.slice(0, 5) === 'v0.10',
    templatesDir = pt.join(__dirname, 'templates'),
    osXFsWatch,
    osXFsWatch010,
    win32Polling,
    win32Polling010,
    slowerDelay,
    testCount = 1,
    mochaIt = it

if (!fs.readFileSync(__filename).toString().match(/\sit\.only\(/)) {
  it = function() {
    testCount++
    mochaIt.apply(this, arguments)
  }
  it.skip = function() {
    testCount--
    mochaIt.skip.apply(this, arguments)
  }
}

before(function(done) {
  rimraf(sysPath.join(__dirname, 'test-fixtures'), function(err) {
    if (err) throw err
    fs.mkdir(fixturesPath, 0x1ed, function(err) {
      if (err) throw err
      while (subdir < testCount) {
        subdir++
        fixturesPath = getFixturePath('')
        fs.mkdir(fixturesPath, 0x1ed, function() {
          if(subdir == testCount) {
            subdir=0
            done()
          }
        })
      }
    })
  })
})

after(function(done) {
  // rimraf(sysPath.join(__dirname, 'test-fixtures'), function(err) {
  //   if (err) throw err
    done()
  // })
})


beforeEach(function() {
  subdir++
  fixturesPath = getFixturePath('')
})

function closeWatchers() {
  var u
  while (u = usedWatchers.pop()) u.close()
}

function disposeWatcher(watcher) {
  if (!watcher || !watcher.close) return
  osXFsWatch ? usedWatchers.push(watcher) : watcher.close()
}

afterEach(function() {
  disposeWatcher(watcher)
})

function simpleCb(err) { if (err) throw err }

function w(fn, to) {
  return setTimeout.bind(null, fn, to || slowerDelay || 50)
}

describe('rinobot', runTests.bind(this, {usePolling: true, interval: 10}));

function runTests(baseopts) {
  baseopts.persistent = true

  before(function() {
    // flags for bypassing special-case test failures on CI
    osXFsWatch = os === 'darwin' && !baseopts.usePolling && !baseopts.useFsEvents
    osXFsWatch010 = osXFsWatch && node010
    win32Polling = os === 'win32' && baseopts.usePolling
    win32Polling010 = win32Polling && node010

    if (win32Polling010) {
      slowerDelay = 900
    } else if (node010 || osXFsWatch) {
      slowerDelay = 200
    } else {
      slowerDelay = undefined
    }
  })

  after(closeWatchers)

  beforeEach(function clean() {
    options = {
      ignored: ['**.rino/**', '**/.rino'] ,
      ignoreInitial:false,
      usePolling: true
    }
    Object.keys(baseopts).forEach(function(key) {
      options[key] = baseopts[key]
    })
  })

  function stdWatcher() {
    return watcher = chokidar.watch(fixturesPath, options)
  }

  function waitFor(spies, fn) {
    function isSpyReady(spy) {
      return Array.isArray(spy) ? spy[0].callCount >= spy[1] : spy.callCount
    }
    function finish() {
      clearInterval(intrvl)
      clearTimeout(to)
      fn()
      fn = Function.prototype
    }
    var intrvl = setInterval(function() {
      if (spies.every(isSpyReady)) finish()
    }, 5)
    var to = setTimeout(finish, 3500)
  }

  describe('catch events', function() {
    var readySpy, rawSpy

    beforeEach(function() {
      options.ignoreInitial = true
      options.alwaysStat = true
      readySpy = sinon.spy(function readySpy(){})
      rawSpy = sinon.spy(function rawSpy(){})
      stdWatcher().on('ready', readySpy).on('raw', rawSpy)
    })

    afterEach(function(done) {
      watcher.close()
      waitFor([readySpy], function() {
        readySpy.should.have.been.calledOnce
        rawSpy = undefined
        done()
      })
    })

    it('should close immediately after an event', function(done) {
      copy('rino-wrong-token.yaml', getFixturePath('rino.yaml'))
      watcher
      .on('all', function(event, path){
        event.should.equal('add')
        path.should.equal(getFixturePath('test.txt'))
        done()
      })
      .on('ready', w(function() {
        copy('test.txt', getFixturePath('test.txt'))
      }))
    })
  })

  describe('run pipelines', function() {
    var readySpy, rawSpy

    beforeEach(function() {
      options.ignoreInitial = true
      options.alwaysStat = true
      readySpy = sinon.spy(function readySpy(){})
      rawSpy = sinon.spy(function rawSpy(){})
      stdWatcher().on('ready', readySpy).on('raw', rawSpy)
    })

    afterEach(function(done) {
      watcher.close()
      waitFor([readySpy], function() {
        readySpy.should.have.been.calledOnce
        rawSpy = undefined
        done()
      })
    })

    it('should parse the created file', function(done) {
      this.timeout(4000)
      copy('rino-log.yaml', getFixturePath('rino.yaml'))
      copy('parse.py', getFixturePath('parse.py'))

      const on_complete = (pipeline) => {
        if (pipeline.filename === "experiment.log"){
          existsSync(pipeline.path + '.yaml').should.equal(true)
          existsSync(pipeline.hiddenMetadataFile).should.equal(true)
          existsSync(pipeline.metadataFilePath).should.equal(true)

          existsSync(pipeline.repoPath).should.equal(true)
          existsSync(pt.join(pipeline.repoPath, '.rino')).should.equal(false)
          existsSync(pt.join(pipeline.repoPath, 'Users')).should.equal(false)

          const diary = JSON.parse(fs.readFileSync(pipeline.hiddenMetadataFile, 'utf-8'))
          const parsedMetadata = yaml.safeLoad(fs.readFileSync(pipeline.metadataFilePath))
          diary.metadata.should.deep.equal(parsedMetadata)

          diary.finished.should.equal(true)
          diary.completedTasks.should.have.property('python')
          done()
        }
      }

      watcher
      .on('all', function(event, path){
        var p = new rinobot.pipeline.Pipeline({
          path,
          event,
          on_complete,
          on_error: defaultOnError,
          on_log: defaultOnLog,
          on_ignore: defaultOnIgnore,
          watchPath: getFixturePath('')
        })
        p.ready(() => {
          if(!p.ignored) p.run()
        })
      })
      .on('ready', w(function() {
        copy('experiment.log', getFixturePath('experiment.log'))
      }))
    })

    it('should parse file with space in name', function(done) {
      copy('rino-log.yaml', getFixturePath('rino.yaml'))
      copy('parse.py', getFixturePath('parse.py'))

      const on_complete = (pipeline) => {
        if (pipeline.filename === "experiment with space.log"){
          existsSync(pipeline.path + '.yaml').should.equal(true)
          existsSync(pipeline.hiddenMetadataFile).should.equal(true)
          existsSync(pipeline.metadataFilePath).should.equal(true)

          existsSync(pipeline.repoPath).should.equal(true)
          existsSync(pt.join(pipeline.repoPath, '.rino')).should.equal(false)
          existsSync(pt.join(pipeline.repoPath, 'Users')).should.equal(false)

          const diary = JSON.parse(fs.readFileSync(pipeline.hiddenMetadataFile, 'utf-8'))
          const parsedMetadata = yaml.safeLoad(fs.readFileSync(pipeline.metadataFilePath))
          diary.metadata.should.deep.equal(parsedMetadata)

          diary.finished.should.equal(true)
          diary.completedTasks.should.have.property('python')
          done()
        }
      }

      watcher
      .on('all', function(event, path){
        var p = new rinobot.pipeline.Pipeline({
          path,
          event,
          on_complete,
          on_error: defaultOnError,
          on_log: defaultOnLog,
          on_ignore: defaultOnIgnore,
          watchPath: getFixturePath('')
        })
        p.ready(() => {
          if(!p.ignored) p.run()
        })
      })
      .on('ready', w(function() {
        copy('experiment.log', getFixturePath('experiment with space.log'))
      }))
    })

    it('should upload to specific folder', function(done) {
      this.timeout(30000)
      copy('rino-upload-to.yaml', getFixturePath('rino.yaml'))
      copy('parse.py', getFixturePath('parse.py'))

      const on_complete = (pipeline) => {
        if (pipeline.filename === "experiment.log"){
          existsSync(pipeline.hiddenMetadataFile).should.equal(true)

          existsSync(pipeline.repoPath).should.equal(true)
          existsSync(pt.join(pipeline.repoPath, '.rino')).should.equal(false)
          existsSync(pt.join(pipeline.repoPath, 'Users')).should.equal(false)

          const diary = JSON.parse(fs.readFileSync(pipeline.hiddenMetadataFile, 'utf-8'))

          diary.finished.should.equal(true)
          diary.completedTasks.should.have.property('rinocloud-upload')
          diary.completedTasks['rinocloud-upload'].match.should.equal("*.log")
          diary.completedTasks['rinocloud-upload'].command.should.equal("rinocloud-upload")
          should.not.equal(diary.response.parent, null)

          pipeline.api
            .getMetadata(diary.response.id)
            .then(function(response){
              should.not.equal(response.parent, null)
              diary.response.should.deep.equal(response)
              done()
            })
            .catch((err) => {done(err)})
        }
      }

      watcher
      .on('all', function(event, path){
        var p = new rinobot.pipeline.Pipeline({
          path,
          event,
          on_complete,
          on_error: defaultOnError,
          on_log: defaultOnLog,
          on_ignore: defaultOnIgnore,
          watchPath: getFixturePath('')
        })
        p.ready(() => {
          if(!p.ignored) p.run()
        })
      })
      .on('ready', w(function() {
        copy('experiment.log', getFixturePath('experiment.log'))
      }))
    })

    it('should parse and upload the created file', function(done) {
      copy('rino-log-parse-upload.yaml', getFixturePath('rino.yaml'))
      copy('parse.py', getFixturePath('parse.py'))

      this.timeout(10000)
      const on_complete = (pipeline) => {
        if (pipeline.filename === "experiment.log"){

          existsSync(pipeline.path + '.yaml').should.equal(true)
          existsSync(pipeline.hiddenMetadataFile).should.equal(true)
          existsSync(pipeline.metadataFilePath).should.equal(true)

          existsSync(pipeline.repoPath).should.equal(true)
          existsSync(pt.join(pipeline.repoPath, '.rino')).should.equal(false)
          existsSync(pt.join(pipeline.repoPath, 'Users')).should.equal(false)

          const diary = JSON.parse(fs.readFileSync(pipeline.hiddenMetadataFile, 'utf-8'))
          const parsedMetadata = yaml.safeLoad(fs.readFileSync(pipeline.metadataFilePath))
          diary.metadata.should.deep.equal(parsedMetadata)

          diary.finished.should.equal(true)
          diary.completedTasks.should.have.property('python')
          diary.completedTasks.should.have.property('rinocloud-upload')
          diary.completedTasks['python'].match.should.equal("*.log")
          diary.completedTasks['rinocloud-upload'].match.should.equal("*.log")

          try{
            pipeline.api
              .getMetadata(diary.response.id)
              .then(function(response){
                diary.response.should.deep.equal(response)
                diary.metadata.should.deep.equal(response.metadata)
                done()
              })
              .catch((err) => {throw err})
          }catch(err){throw err}
        }
      }

      watcher
      .on('all', function(event, path){
        var p = new rinobot.pipeline.Pipeline({
          path,
          event,
          on_complete,
          on_error: defaultOnError,
          on_log: defaultOnLog,
          on_ignore: defaultOnIgnore,
          watchPath: getFixturePath('')
        })
        p.ready(() => {
          if(!p.ignored) p.run()
        })
      })
      .on('ready', w(function() {
        copy('experiment.log', getFixturePath('experiment.log'))
      }))
    })

    it('should fail and retry', function(done) {
      copy('rino-log.yaml', getFixturePath('rino.yaml'))
      copy('parse-with-error.py', getFixturePath('parse.py'))

      this.timeout(10000)
      const on_complete = (pipeline) => {
        done()
      }

      const on_log = (pipeline, msg) => {
        defaultOnLog(pipeline, msg)
        if (msg === `Pipeline failed`){
          copy('parse.py', getFixturePath('parse.py'))
        }
      }

      watcher
      .on('all', function(event, path){
        var p = new rinobot.pipeline.Pipeline({
          path,
          event,
          on_complete,
          on_log,
          on_error: defaultOnError,
          on_ignore: defaultOnIgnore,
          watchPath: getFixturePath(''),
          retry: true,
        })
        p.ready(() => {
          if(!p.ignored) p.run()
        })
      })
      .on('ready', w(function() {
        copy('experiment.log', getFixturePath('experiment.log'))
      }))
    })

    it('should upload a file and attach metadata later', function(done) {
      this.timeout(50000)
      copy('rino-upload-to.yaml', getFixturePath('rino.yaml'))
      let completedPipelines = 0;
      let firstPipeline;

      const on_complete = (pipeline) => {
        if (completedPipelines == 0) firstPipeline = pipeline

        completedPipelines++
        copy('experiment.yaml', getFixturePath('experiment.log.yaml'))
        if (completedPipelines >= 2) {

          existsSync(firstPipeline.path + '.yaml').should.equal(true)
          existsSync(firstPipeline.hiddenMetadataFile).should.equal(true)
          existsSync(firstPipeline.repoPath).should.equal(true)
          existsSync(pt.join(firstPipeline.repoPath, '.rino')).should.equal(false)
          existsSync(pt.join(firstPipeline.repoPath, 'Users')).should.equal(false)
          const diary = JSON.parse(fs.readFileSync(firstPipeline.hiddenMetadataFile, 'utf-8'))
          diary.metadata.should.deep.equal(pipeline.metadata)
          diary.response.metadata.should.deep.equal(pipeline.metadata)
          done()
        }
      }

      watcher
      .on('all', function(event, path){
        var p = new rinobot.pipeline.Pipeline({
          path,
          event,
          on_complete,
          on_log: defaultOnLog,
          on_error: (pipeline, error) => { done(error) },
          on_ignore: defaultOnIgnore,
          watchPath: getFixturePath(''),
        })
        p.ready(() => {
          if(!p.ignored) p.run()
        })
      })
      .on('ready', w(function() {
        copy('experiment.log', getFixturePath('experiment.log'))
      }))
    })

    it('should copy a file', function(done) {
      const target = pt.join(getFixturePath(''), 'sub')
      const target_str = JSON.stringify(target)

      const yam = `
apiToken: 123
metadata:
  location: ${target_str}

tasks:
  - match: "*.log"
    command: "rinocloud-copy"
    args: "{{join(location, path)}}"
      `

      fs.writeFileSync(getFixturePath('rino.yaml'), yam, 'utf-8')

      this.timeout(10000)
      const on_complete = (pipeline) => {
        existsSync(target).should.equal(true)
        done()
      }

      watcher
      .on('all', function(event, path){
        var p = new rinobot.pipeline.Pipeline({
          path,
          event,
          on_complete,
          on_log: defaultOnLog,
          on_error: defaultOnError,
          on_ignore: defaultOnIgnore,
          watchPath: getFixturePath(''),
        })
        p.ready(() => {
          if(!p.ignored) p.run()
        })
      })
      .on('ready', w(function() {
        copy('experiment.log', getFixturePath('experiment.log'))
      }))
    })

  })

  describe('catch errors', function() {
    var readySpy, rawSpy

    beforeEach(function() {
      options.ignoreInitial = true
      options.alwaysStat = true
      readySpy = sinon.spy(function readySpy(){})
      rawSpy = sinon.spy(function rawSpy(){})
      stdWatcher().on('ready', readySpy).on('raw', rawSpy)
    })

    afterEach(function(done) {
      watcher.close()
      waitFor([readySpy], function() {
        readySpy.should.have.been.calledOnce
        rawSpy = undefined
        done()
      })
    })

    it('should throw error because no rino.yaml file', function(done) {
      const on_error = (pipeline, err) => {
        err.code.should.equal('ENOENT')
        err.path.should.equal(pipeline.configPath)
        done()
      }

      watcher
      .on('all', function(event, path){
        var p = new rinobot.pipeline.Pipeline({
          path,
          event,
          on_complete: defaultOnComplete,
          on_error: on_error,
          on_log: defaultOnLog,
          on_ignore: defaultOnIgnore,
          watchPath: getFixturePath('')
        })
        p.ready(() => {
          if(!p.ignored) p.run()
        })
      })
      .on('ready', w(function() {
        copy('test.txt', getFixturePath('test.txt'))
      }))
    })

    it('should throw upload auth error', function(done) {
      this.timeout(3000)
      copy('rino-wrong-token.yaml', getFixturePath('rino.yaml'))

      const on_error = (pipeline, err) => {
        err.status.should.equal(403)
        done()
      }

      watcher
      .on('all', function(event, path){
        var p = new rinobot.pipeline.Pipeline({
          path,
          event,
          on_complete: defaultOnComplete,
          on_error: on_error,
          on_log: defaultOnLog,
          on_ignore: defaultOnIgnore,
          watchPath: getFixturePath('')
        })
        p.ready(() => {
          if(!p.ignored) p.run()
        })
      })
      .on('ready', w(function() {
        copy('test.txt', getFixturePath('test.txt'))
      }))
    })

    it('should fail to parse', function(done) {
      copy('rino-log-parse-upload.yaml', getFixturePath('rino.yaml'))
      copy('parse-with-error.py', getFixturePath('parse.py'))

      const on_error = (pipeline, err) => {
        var b = (err.message.indexOf('python parse.py') > -1)
        b.should.equal(true)
        done()
      }

      watcher
      .on('all', function(event, path){
        var p = new rinobot.pipeline.Pipeline({
          path,
          event,
          on_complete: defaultOnComplete,
          on_error: on_error,
          on_log: defaultOnLog,
          on_ignore: defaultOnIgnore,
          watchPath: getFixturePath('')
        })
        p.ready(() => {
          if(!p.ignored) p.run()
        })
      })
      .on('ready', w(function() {
        copy('experiment.log', getFixturePath('experiment.log'))
      }))
    })

    it('should throw a spawn error for non-existing program', function(done) {
      copy('rino-bad-spawn.yaml', getFixturePath('rino.yaml'))

      const on_error = (pipeline, err) => {
        err.code.should.equal('ENOENT')
        done()
      }

      watcher
      .on('all', function(event, path){
        var p = new rinobot.pipeline.Pipeline({
          path,
          event,
          on_complete: defaultOnComplete,
          on_error: on_error,
          on_log: defaultOnLog,
          on_ignore: defaultOnIgnore,
          watchPath: getFixturePath('')
        })
        p.ready(() => {
          if(!p.ignored) p.run()
        })
      })
      .on('ready', w(function() {
        copy('experiment.log', getFixturePath('experiment.log'))
      }))
    })
  })

  describe('user specific', function() {
    var readySpy, rawSpy

    beforeEach(function() {
      options.ignoreInitial = true
      options.alwaysStat = true
      readySpy = sinon.spy(function readySpy(){})
      rawSpy = sinon.spy(function rawSpy(){})
      stdWatcher().on('ready', readySpy).on('raw', rawSpy)
    })

    afterEach(function(done) {
      watcher.close()
      waitFor([readySpy], function() {
        readySpy.should.have.been.calledOnce
        rawSpy = undefined
        done()
      })
    })

    it('should parse, plot and upload sxm data', function(done) {
      this.timeout(60000)
      copy('rino-sxm.yaml', getFixturePath('rino.yaml'))
      copy('plot-sxm.py', getFixturePath('plot-sxm.py'))
      copy('parse-sxm.py', getFixturePath('parse-sxm.py'))

      const taskCount = 6
      let taskDone = 0

      const on_complete = (pipe) =>{
        console.log(`\t\t${pipe.relPath} complete`)

        taskDone++;
        if (taskCount === taskDone) done()
      }

      watcher
      .on('all', function(event, path){
        var p = new rinobot.pipeline.Pipeline({
          path,
          event,
          on_complete,
          on_error: defaultOnError,
          on_log: defaultOnLog,
          on_ignore: defaultOnIgnore,
          watchPath: getFixturePath('')
        })
        p.ready(() => {
          if(!p.ignored) p.run()
        })
      })
      .on('ready', w(function() {
        copy('data.sxm', getFixturePath('data.sxm'))
      }))
    })

    if (os === "win32"){
      it('should copy to a network location', function(done){
        this.timeout(20000)
        copy('rino-network-copy.yaml', getFixturePath('rino.yaml'))

        const on_complete = (pipe) =>{
          existsSync(pt.join(pipe.metadata.location, pipe.filename)).should.equal(true)
          done()
        }

        watcher
        .on('all', function(event, path){
          var p = new rinobot.pipeline.Pipeline({
            path,
            event,
            on_complete,
            on_error: defaultOnError,
            on_log: defaultOnLog,
            on_ignore: defaultOnIgnore,
            watchPath: getFixturePath('')
          })
        })
        .on('ready', w(function() {
          copy('test.txt', getFixturePath('test.txt'))
        }))
      })
    }

  })

}
