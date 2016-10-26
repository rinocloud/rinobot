
import _ from 'lodash'
import fs from 'fs-extra'
import crypto from 'crypto'
const CHUNK_SIZE = 6 * 1024 * 1024


export const done = (hashList, cb) => {
  const binaryList = _.map(hashList, h => new Buffer(h, 'hex'))
  const concatedBytes = Buffer.concat(binaryList)
  const finalHash = crypto.createHash('md5').update(concatedBytes).digest('hex')

  const finalHashStr = `${finalHash}-${hashList.length}`
  cb(null, finalHashStr)
}

export const hashFile = (filepath, cb) => {
  const hashList = []
  const buffer = new Buffer(CHUNK_SIZE)
  fs.open(filepath, 'r', (err, fd) => {
    if (err) return cb(err, null)

    const readChunk = () => {
      fs.read(fd, buffer, 0, CHUNK_SIZE, null, (er, nread) => {
        if (er) {
          return fs.close(fd, (e) => {
            if (err) return cb(e, null)
          })
        }

        if (nread === 0) {
          return fs.close(fd, (error) => {
            if (err) return cb(error, null)
            done(hashList, cb)
          })
        }

        let data
        if (nread < CHUNK_SIZE) {
          data = buffer.slice(0, nread)
        } else {
          data = buffer
        }

        const hash = crypto
          .createHash('md5')
          .update(data)
          .digest('hex')

        hashList.push(hash)
        readChunk()
      })
    }

    readChunk()
  })
}

export default hashFile
