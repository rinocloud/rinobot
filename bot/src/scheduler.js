import async from 'async'

export function jobCallback(jobQueue, err) {
  if (err) {
    const drain = jobQueue.drain
    jobQueue.kill()
    drain(err)
  }
}

export function createQueue(funcArray) {
  return function (funcArray, jobCallback, pipelineCallback) { // eslint-disable-line
    const jobQueue = new async.queue(function (job, callback) { // eslint-disable-line
      job(callback)
    }, 1);

    jobQueue.drain = pipelineCallback
    jobQueue.push(funcArray, jobCallback.bind(null, jobQueue))

    return jobQueue
  }.bind(null, funcArray, jobCallback)
}

export const pipelineQueue = async.queue((job, callback) => {
  job(callback)
}, 1)
