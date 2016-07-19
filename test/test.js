
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'
import fs from 'fs-extra'
import _ from 'lodash'
import pt from 'path'
const rmAfter = false

function getFixturePath(subPath) {
  return pt.join(
    __dirname,
    'test-fixtures',
    subdir && subdir.toString() || '',
    subPath
  )
}

let fixturesPath = getFixturePath('')
let subdir = 0
let testCount = 1
const mochaIt = it

if (!fs.readFileSync(__filename).toString().match(/\sit\.only\(/)) {
  it = function () { // eslint-disable-line
    testCount++
    mochaIt.apply(this, arguments) // eslint-disable-line
  }
  it.skip = function() { // eslint-disable-line
    testCount--
    mochaIt.skip.apply(this, arguments) // eslint-disable-line
  }
}

before((done) => {
  rimraf(pt.join(__dirname, 'test-fixtures'), (err) => {
    if (err) throw err
    fs.mkdir(fixturesPath, 0x1ed, (err) => { // eslint-disable-line
      if (err) throw err
      while (subdir < testCount) {
        subdir++
        fixturesPath = getFixturePath('')
        fs.mkdir(fixturesPath, 0x1ed, () => { // eslint-disable-line
          if (subdir === testCount) {
            subdir = 0
            done()
          }
        })
      }
    })
  })
})

after((done) => {
  if (!rmAfter) return done()
  rimraf(pt.join(__dirname, 'test-fixtures'), (err) => {
    if (err) throw err
    done()
  })
})


beforeEach(() => {
  subdir++
  fixturesPath = getFixturePath('')
})

describe('performance testing', () => {
  beforeEach(function () {
    this.timeout(20000)
    const maxDepth = 5
    let currentDepth = 1

    const makeFiles = (index = 1) => {
      if (currentDepth >= maxDepth) return

      const newDir = pt.join(
                      getFixturePath(''),
                      _.reduce(_.range(1, index + 1), (i, j) =>
                        pt.join(i.toString(), j.toString())).toString()
                    )

      mkdirp.sync(newDir)
      _.each(_.range(1, maxDepth + 1), i => {
        const fileName = pt.join(newDir, `test${i}.txt`)
        fs.writeFileSync(fileName, '123')
      })

      currentDepth ++
      makeFiles(index + 1)
    }
    makeFiles()
  })

  afterEach(function () {}) // eslint-disable-line

  it('should close immediately', function (done) { // eslint-disable-line
    done()
  })
})
