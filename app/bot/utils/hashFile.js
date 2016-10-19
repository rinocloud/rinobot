
import _ from 'lodash'
import fs from 'fs-extra'
import crypto from 'crypto'
const CHUNK_SIZE = 6 * 1024 * 1024
const buffer = new Buffer(CHUNK_SIZE)

export const done = (hashList, cb) => {
  const binaryList = _.map(hashList, h => new Buffer(h, 'hex'))
  const concatedBytes = Buffer.concat(binaryList)
  const finalHash = crypto.createHash('md5').update(concatedBytes).digest('hex')
  cb(null, finalHash)
}

export default (filepath, cb) => {
  const hashList = []

  fs.open(filepath, 'r', (err, fd) => {
    if (err) return cb(err, null)

    const readChunk = () => {
      fs.read(fd, buffer, 0, CHUNK_SIZE, null, (err, nread) => { // eslint-disable-line
        if (err) {
          return fs.close(fd, (err) => { // eslint-disable-line
            if (err) cb(err, null)
          })
        }

        if (nread === 0) {
          return fs.close(fd, (err) => { // eslint-disable-line
            if (err) cb(err, null)
            done(hashList, cb)
          })
        }

        let data
        if (nread < CHUNK_SIZE) {
          data = buffer.slice(0, nread)
        } else {
          data = buffer
        }

        const hash = crypto.createHash('md5')
        hash
          .update(data)

        hashList.push(hash.digest('hex'))
        readChunk()
      })
    }

    readChunk()
  })
}
