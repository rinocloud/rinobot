import { Task } from '../bot/task'
import createPipeline, { createQueue, queue } from '../bot/pipeline'
import { isMatch } from '../bot/utils'
import rimraf from 'rimraf'
import assert from 'assert'
import _ from 'lodash'
import pt from 'path'
import fs from 'fs-extra'


let subdir = 0
let testCount = 1
const mochaIt = it
let fixturesPath = pt.join(__dirname, 'test-fixtures', subdir && subdir.toString() || '')


const getFixturePath = (subPath) =>
  /* creates a new unique folder for each test
     and we can add files to that path using
     getFixturePath('somefile.txt')
  */
  pt.join(
    __dirname,
    'test-fixtures',
    subdir && subdir.toString() || '',
    subPath
  )


const getTemplatePath = (subPath) =>
  /* attaches the subpath to the path of the test
     template files
     so `getTemplatePath('data.txt')` will return
     `/User/.../test/templates/data.txt`
  */
  pt.join(
    __dirname,
    'templates',
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

describe('Pipeline', () => {
  beforeEach(() => {
    subdir++
    fixturesPath = getFixturePath('')
  })

  it('should create a hidden output file', (done) => {
    const filematch = '*.txt'
    const taskConfig = {
      name: 'rinobot-plugin-normalize',
      args: '--column=2 --algo=max'
    }

    fs.copySync(
      getTemplatePath(pt.join('data', 'test.txt')),
      getFixturePath('test.txt')
    )

    const inputFile = getFixturePath('test.txt')

    const task = new Task({
      filepath: inputFile,
      pluginsDir: getTemplatePath(''),
      baseDir: getFixturePath(''),
      command: taskConfig.name,
      match: filematch,
      args: taskConfig.args,
      onLog: (_task, log) => { console.log(log) },
      onComplete: (_task) => {
        assert(fs.existsSync(pt.join(
          pt.dirname(_task.filepath),
          _task.outputFilename
        )))
        done()
      },
      onError: (_task, error) => { done(error) }
    })

    task.ready(() => {
      task.run()
    })
  })

  it('should prep properly', (done) => {
    const config = {
      pipelines: [
        {
          filematch: '*.txt',
          tasks: [
            {
              name: 'rinobot-plugin-normalize',
              args: '--column=2 --algo=max'
            },
            {
              name: 'rinobot-plugin-shift',
              args: '--column=2 --shift=20'
            },
          ]
        }
      ]
    }

    fs.copySync(
      getTemplatePath(pt.join('data', 'test.txt')),
      getFixturePath('test.txt')
    )

    _.map(config.pipelines, (pipeline) => {
      const { filematch, tasks } = pipeline
      let inputFile = getFixturePath('test.txt')

      const taskList = _.map(tasks, (taskConfig, index) => finished => {
        let ignore = false
        if (index === 0) {
          if (!isMatch(filematch, pt.basename(inputFile))) {
            ignore = true
          }
        }

        const task = new Task({
          filepath: inputFile,
          pluginsDir: getTemplatePath(''),
          baseDir: getFixturePath(''),
          command: taskConfig.name,
          match: filematch,
          args: taskConfig.args,
          onLog: () => {},
          onComplete: () => {
            inputFile = pt.join(
              pt.dirname(task.filepath),
              task.outputFilename
            )
            finished()
          },
          onError: () => {}
        })

        task.ready(() => {
          if (index === 0) {
            assert.equal(ignore, false)
            assert.equal(task.ignored, false)
          }
          if (index === 1) {
            assert.equal(ignore, false)
            assert.equal(task.ignored, false)
          }

          task.run()
        })
      })

      queue.push(createQueue(taskList), (err) => {
        if (err) return done(err)
        done()
      })
    })
  })

  it('should run two pipelines', (done) => {
    const config = {
      pipelines: [
        {
          filematch: '*.txt',
          tasks: [
            {
              name: 'rinobot-plugin-normalize',
              args: '--column=2 --algo=max'
            },
            {
              name: 'rinobot-plugin-shift',
              args: '--column=2 --shift=20'
            },
          ]
        },
        {
          filematch: '*.dat',
          tasks: [
            {
              name: 'rinobot-plugin-shift',
              args: '--column=2 --shift=20'
            },
          ]
        }
      ]
    }

    fs.copySync(
      getTemplatePath(pt.join('data', 'test.txt')),
      getFixturePath('test.txt')
    )

    fs.copySync(
      getTemplatePath(pt.join('data', 'test.txt')),
      getFixturePath('test.dat')
    )

    let doneCount = 0
    const onComplete = () => {
      doneCount += 1
      if (doneCount === 3) done()
    }

    createPipeline({
      pluginsDir: getTemplatePath(''),
      filepath: getFixturePath('test.txt'),
      baseDir: getFixturePath(''),
      config,
      onTaskStart: () => {},
      onTaskLog: () => {},
      onTaskError: () => {},
      onTaskIgnore: () => {},
      onError: () => {},
      onTaskComplete: onComplete,
    })

    createPipeline({
      pluginsDir: getTemplatePath(''),
      filepath: getFixturePath('test.dat'),
      baseDir: getFixturePath(''),
      config,
      onTaskStart: () => {},
      onTaskLog: () => {},
      onTaskError: () => {},
      onTaskIgnore: () => {},
      onError: () => {},
      onTaskComplete: onComplete,
    })
  })
})
