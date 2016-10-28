import { exec } from 'child_process'

export const checkPythonVersion = (cb) => {
  // returns callback with values 2, 3 or false
  exec('python3 -V', (error) => {
    if (error) {
      exec('python2 -V', (err, stdout, stderr) => {
        if (err) return cb(false)
        const re = /\w+\s(\d+\.\d+\.\d+)(\s+\w+)?/
        let m
        if ((m = re.exec(stderr)) !== null) { // eslint-disable-line
          if (m.index === re.lastIndex) {
            re.lastIndex++;
          }
          if (m[1][0] === '3') {
            cb('3')
          } else if (m[1][0] === '2') {
            cb('2')
          } else {
            cb(false)
          }
        } else {
          cb(false)
        }
      })
    } else {
      cb('3')
    }
  })
}

export default checkPythonVersion
