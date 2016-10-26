
import hashFile from '../bot/utils/hashFile'

describe('hash', () => {
  it('should hash', (done) => {
    hashFile('/Users/eoinmurray/Desktop/Rinobot/sync-test/laser_spectrum_1.txt', (err, hash) => {
    })
    hashFile('/Users/eoinmurray/Desktop/Rinobot/sync-test/test1.txt', (err, hash) => {
      done()
    })
  })
})
