import { getPythonPath } from '../bot/utils/pythonKernel'

describe('python installation', () => {
  it('should find python', (done) => {
    getPythonPath((err, path) => {
      console.log(path)
      done()
    })
  })
})
