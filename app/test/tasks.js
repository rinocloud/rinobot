import runPlugin from '../bot/pipeline/runPlugin'
import runPython from '../bot/pipeline/runPython'
import runMatlab from '../bot/pipeline/runMatlab'
import runR from '../bot/pipeline/runR'
import { exec } from 'child_process'
import rimraf from 'rimraf'
import assert from 'assert'
import mkdirp from 'mkdirp'
import pt from 'path'
import fs from 'fs'
import _ from 'lodash'

let subdir = 0
let doOptionalTest = true
let testCount = 1
const mochaIt = it
const testMatlab = false
let fixturesPath = pt.join(__dirname, 'test-fixtures', subdir && subdir.toString() || '')

export const checkForProgram = (program, cb) => {
  exec(program, (error) => {
    if (error) {
      cb(false)
    } else {
      cb(true)
    }
  })
}

const getFixturePath = (subPath) =>
  /*
    creates a new unique folder for each test
    and we can add files to that path using
    getFixturePath('somefile.txt')
  */
  pt.join(
    __dirname,
    'test-fixtures',
    subdir && subdir.toString() || '',
    subPath
  )

if (!fs.readFileSync(__filename).toString().match(/\sit\.only\(/)) {
  /*
    We monkey patch the test 'it' function so that we can track
    how many tests have run to create the new folders
  */
  it = function() { // eslint-disable-line
    testCount++
    mochaIt.apply(this, arguments) // eslint-disable-line
  }
  it.skip = function() { // eslint-disable-line
    testCount--
    mochaIt.skip.apply(this, arguments) // eslint-disable-line
  }
}

before(done => {
  /*
    lets delete the test-fixtures folder before the tests run
  */
  let writtenCount = 0
  function wrote(err) {
    if (err) throw err
    if (++writtenCount === testCount) {
      subdir = 0
      done()
    }
  }

  rimraf(pt.join(__dirname, 'test-fixtures'), err => {
    if (err) throw err
    fs.mkdir(fixturesPath, 0x1ed, (err) => { // eslint-disable-line
      if (err) throw err
      while (subdir < testCount) {
        subdir++
        fixturesPath = getFixturePath('')
        fs.mkdir(fixturesPath, 0x1ed, wrote)
      }
    })
  })
})

describe('runTasks', () => {
  beforeEach(function (done) {
    /*
      For this batch of tests which run sub-processes
      like python, R and matlab - we want to only run
      the test if the corresponding program exists so we
      check before each test.
    */
    this.timeout(20000)
    const title = this.currentTest.title

    if (title.includes('matlab') && !testMatlab) {
      subdir++
      fixturesPath = getFixturePath('')
      return done()
    }
    let program = 'python -V'
    if (title.includes('matlab')) {
      program = 'matlab -nosplash -nodesktop -nodisplay -r "exit"'
    }
    if (title.includes('Rscript')) {
      program = 'Rscript --version'
    }
    if (title.includes('python')) {
      program = 'python -V'
    }

    checkForProgram(program, (exists) => {
      if (exists) {
        doOptionalTest = true
      } else {
        doOptionalTest = false
      }
      subdir++
      fixturesPath = getFixturePath('')
      done()
    })
  })

  it('python runs', function (done) {
    if (!doOptionalTest) return this.skip()
    const codePath = getFixturePath(pt.join('folder w space', 'script with space.py'))
    const locals = {
      filepath: getFixturePath(pt.join('folder w space', 'test.txt'))
    }
    const cwd = pt.dirname(codePath)

    const onLog = (l) => {
      assert(l.includes('hello'))
    }

    const code = 'print("hello")'

    mkdirp(cwd, err => {
      if (err) return done(err)
      fs.writeFile(codePath, code, err => { // eslint-disable-line
        if (err) return done(err)
        runPython({
          codePath,
          locals,
          cwd,
          onLog,
          onError: done,
          onComplete: done
        })
      })
    })
  })

  it('plugin runs and can import file @python', function (done) {
    if (!doOptionalTest) return this.skip()
    const locals = {
      filepath: getFixturePath(pt.join('test w space.txt'))
    }
    const cwd = pt.dirname(locals.filepath)

    const codePath = pt.join(cwd, 'test-plugin', 'index.py')
    const packagePath = pt.join(cwd, 'test-plugin', 'package.json')
    const code = `
import sys
s = ''
with open (sys.argv[1], "r") as myfile:
  for r in myfile.readlines():
    s = s + str(r)
s = s + str(sys.argv[2])
s = s + str(sys.argv[3])
print(s)
    `

    let log = ''
    const packageJSON = JSON.stringify({ main: 'index.py' })
    const onLog = (l) => { log += l }
    const onComplete = () => {
      const comparison = '123--xmin=5--xmax=7'
      assert.equal(
        _.trim(log).replace(/\r/g, '').replace(/\n/g, ''),
        comparison,
      )
      done()
    }

    mkdirp(pt.join(cwd, 'test-plugin'), err => {
      if (err) return done(err)
      fs.writeFile(codePath, code, err => { // eslint-disable-line
        if (err) return done(err)
        fs.writeFile(packagePath, packageJSON, err => { // eslint-disable-line
          if (err) return done(err)
          fs.writeFile(locals.filepath, '1\n2\n3\n', (error) => {
            if (error) return done(error)
            runPlugin({
              pluginsDir: cwd,
              command: 'test-plugin',
              filepath: locals.filepath,
              args: '--xmin=5 --xmax=7',
              cwd,
              onLog,
              onComplete,
              onError: done
            })
          })
        })
      })
    })
  })

  it('Rscript runs', function (done) {
    if (!doOptionalTest) return this.skip()
    const codePath = getFixturePath(pt.join('folder w space', 'script with space.R'))
    const locals = {
      filepath: getFixturePath(pt.join('folder w space', 'test.txt'))
    }
    const cwd = pt.dirname(codePath)

    let log = ''
    const onLog = (l) => {
      log += l
    }

    const onComplete = () => {
      assert(_.trim(log).includes('hello'))
      done()
    }

    const code = 'print("hello")'

    mkdirp(cwd, err => {
      if (err) return done(err)
      fs.writeFile(codePath, code, (err) => { // eslint-disable-line
        if (err) return done(err)
        runR({
          codePath,
          locals,
          cwd,
          onLog,
          onError: done,
          onComplete
        })
      })
    })
  });

  it('matlab runs', function (done) { // eslint-disable-line
    if (!doOptionalTest || !testMatlab) return this.skip()
    this.timeout(20000)

    const codePath = getFixturePath(pt.join('folder w space', 'script_wo_space.m'))
    const locals = {
      filepath: getFixturePath(pt.join('folder w space', 'test.txt'))
    }
    const cwd = pt.dirname(codePath)

    let log = ''
    const onLog = (l) => {
      log += l
    }

    const onComplete = () => {
      assert(_.trim(log).includes(locals.filepath))
      done()
    }

    const code = 'disp(filepath)'

    mkdirp(cwd, (err) => {
      if (err) return done(err)
      fs.writeFile(codePath, code, (err) => { // eslint-disable-line
        if (err) return done(err)
        runMatlab({
          codePath,
          filepath: locals.filepath,
          cwd,
          onLog,
          onComplete,
          onError: done
        })
      })
    })
  })
})
