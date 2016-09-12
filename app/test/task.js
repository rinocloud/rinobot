import assert from 'assert'
import { isMatch } from '../bot/utils'


describe('Tasks pattern matching mutliple', () => {
  it('should not match', (done) => {
    const filename = 'file-shift-col1.txt'
    const match = '*.dat,*.txt,!*shift*.txt'

    const passing = isMatch(match, filename)
    assert.equal(passing, false)
    done()
  })

  it('should match', (done) => {
    const filename = 'file-shift-col1.dat'
    const match = '*.txt,!*shift*.txt,*.dat'

    const passing = isMatch(match, filename)
    assert.equal(passing, true)
    done()
  })
})
