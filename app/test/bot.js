
import runPython from '../bot/runPython'
import runMatlab from '../bot/runMatlab'
import runR from '../bot/runR'
import { exec } from 'child_process'
import rimraf from 'rimraf'
import assert from 'assert'
import mkdirp from 'mkdirp'
import pt from 'path'
import fs from 'fs'

export const checkForProgram = (program, cb) => {
  // returns callback with values 2, 3 or false
  exec(program, (error, stdout) => {
    if (error) cb(false)
    cb(stdout)
  })
}


const getFixturePath = (subPath) =>
  pt.join(
    __dirname,
    'test-fixtures',
    subdir && subdir.toString() || '',
    subPath
  )


let subdir = 0
let doOptionalTest = true
let testCount = 1
const mochaIt = it
let fixturesPath = getFixturePath('')

if (!fs.readFileSync(__filename).toString().match(/\sit\.only\(/)) {
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

beforeEach(function (done) {
  this.timeout(20000)
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
})

describe('Tasks which run sub-processes', () => {
  (doOptionalTest ? it : it.skip)('python3 -V', done => {
    const codePath = getFixturePath(pt.join('folder w space', 'script with space.py'))
    const locals = {
      filepath: getFixturePath(pt.join('folder w space', 'test.txt'))
    }
    const cwd = pt.dirname(codePath)

    const onLog = (l) => {
      assert.equal(l, 'hello\n')
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
  });

  (doOptionalTest ? it : it.skip)('Rscript --version', done => {
    const codePath = getFixturePath(pt.join('folder w space', 'script with space.R'))
    const locals = {
      filepath: getFixturePath(pt.join('folder w space', 'test.txt'))
    }
    const cwd = pt.dirname(codePath)

    const onLog = (l) => {
      assert.equal(l, '[1] "hello"\n')
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

  (doOptionalTest ? it : it.skip)('matlab -nosplash -nodesktop -nodisplay -r "exit;"', function (done) { // eslint-disable-line
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

    const code = 'disp(filepath);'

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
  });
})
