import async from 'async'

export const jobCallback = (jobQueue, err) => {
  if (err) {
    const drain = jobQueue.drain
    jobQueue.kill()
    drain(err)
  }
}

export const createQueue = (funcArray) => (pipelineCallback) => {
  const jobQueue = new async.queue(function (job, callback) { // eslint-disable-line
    job(callback)
  }, 1);

  jobQueue.drain = pipelineCallback
  jobQueue.push(funcArray, jobCallback.bind(null, jobQueue))

  return jobQueue
}

export const queue = async.queue((job, callback) => {
  job(callback)
}, 1)
