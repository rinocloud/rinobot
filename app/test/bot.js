import runPython from '../bot/runPython'
import runMatlab from '../bot/runMatlab'
import runR from '../bot/runR'
import { exec } from 'child_process'
import rimraf from 'rimraf'
import assert from 'assert'
import mkdirp from 'mkdirp'
import pt from 'path'
import fs from 'fs'

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

describe('Tasks which run sub-processes', () => {
  beforeEach(function (done) {
    /*
      For this batch of tests which run sub-processes
      like python, R and matlab - we want to only run
      the test if the corresponding program exists so we
      check before each test.
    */
    this.timeout(20000)

    if (this.currentTest.title.includes('matlab') && !testMatlab) {
      subdir++
      fixturesPath = getFixturePath('')
      done()
    } else {
      checkForProgram(this.currentTest.title, (exists) => {
        if (exists) {
          doOptionalTest = true
        } else {
          doOptionalTest = false
        }
        subdir++
        fixturesPath = getFixturePath('')
        done()
      })
    }
  })

  it('python -V', done => {
    if (!doOptionalTest) return this.skip()
    const codePath = getFixturePath(pt.join('folder w space', 'script with space.py'))
    const locals = {
      filepath: getFixturePath(pt.join('folder w space', 'test.txt'))
    }
    const cwd = pt.dirname(codePath)

    const onLog = (l) => {
      assert.equal(l.includes('hello'), true)
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

  it('Rscript --version', function (done) {
    if (!doOptionalTest) return this.skip()
    const codePath = getFixturePath(pt.join('folder w space', 'script with space.R'))
    const locals = {
      filepath: getFixturePath(pt.join('folder w space', 'test.txt'))
    }
    const cwd = pt.dirname(codePath)

    const onLog = (l) => {
      assert.equal(l.includes('hello'), true)
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
          onComplete: done
        })
      })
    })
  });

  it('matlab -nosplash -nodesktop -nodisplay -r "exit"', function (done) { // eslint-disable-line
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
      if (log.includes(locals.filepath)) {
        done()
      } else {
        done(new Error('Logs from matlab did not include required text '))
      }
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
