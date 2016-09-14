import rimraf from 'rimraf'
import pt from 'path'
import fs from 'fs'
let subdir = 0
let testCount = 1
const mochaIt = it
let fixturesPath = pt.join(__dirname, 'test-fixtures', subdir && subdir.toString() || '')

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
  // lets delete the test-fixtures folder before the tests run
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
  beforeEach(() => {
    subdir++
    fixturesPath = getFixturePath('')
  })

  it('test pipeline', (done) => { done() })
})
