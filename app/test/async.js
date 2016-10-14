import _ from 'lodash'
import async from 'async'
import assert from 'assert'

describe('async', () => {
  it('builds a list of task functions for queue', function (done) {
    this.timeout(4000)
    const sortedTasks = [
      [{ name: 'rebin1' }, { name: 'rebin2' }],
      [{ name: 'plot' }]
    ]

    let inputFiles = ['data.txt']
    const createdFiles = ['data.txt']

    const mapInputFiles = (taskConfig, outputFiles) =>
      _.flatMap(inputFiles, (inputFile) => subFinished => {
        setTimeout(() => {
          const outputFile = `${inputFile}-${taskConfig.name}`
          outputFiles.push(outputFile)
          createdFiles.push(outputFile)
          subFinished(true)
        }, 200)
      })

    const buildBatch = (taskBatch) => finished => {
      const outputFiles = []
      const batch = _.flatMap(taskBatch, (taskConfig) => mapInputFiles(taskConfig, outputFiles))

      const subQueue = async.queue((job, callback) => job(callback), 1)
      subQueue.drain = () => {
        inputFiles = outputFiles
        finished(true)
      }

      subQueue.push(batch, (_continue) => {
        if (_.isError(_continue) || _continue === false) {
          const drain = queue.drain
          subQueue.kill()
          drain(_continue)
        }
      })
      return batch
    }

    const taskList = _.flatMap(sortedTasks, buildBatch)

    const queue = async.queue((job, callback) => job(callback), 1)
    queue.drain = () => {
      const expectedOutput = [
        'data.txt',
        'data.txt-rebin1',
        'data.txt-rebin2',
        'data.txt-rebin1-plot',
        'data.txt-rebin2-plot'
      ]
      assert.deepEqual(createdFiles, expectedOutput)
      done()
    }
    queue.push(taskList, (_continue) => {
      if (_.isError(_continue) || _continue === false) {
        const drain = queue.drain
        queue.kill()
        drain(_continue)
      }
    })
  })
})
