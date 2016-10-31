import { exec } from 'child_process'
import pt from 'path'

const isOSX = process.platform === 'darwin'

export const getPipOSX = (callback) => {
  const anacondaPath = `${pt.join(process.env.HOME, 'anaconda/bin/pip')}`

  exec(`${anacondaPath} -V`, (error) => {
    if (!error) return callback(null, anacondaPath)
    exec('pip -V', (err) => {
      if (!err) return callback(null, 'pip')
      return callback(new Error('No pip found.'))
    })
  })
}

export const getPipWin = (callback) => {
  exec('pip -V', (err) => {
    if (!err) return callback(null, 'pip')
    return callback(new Error('No pip found.'), null)
  })
}

export const getPipPath = (callback) => {
  if (isOSX) {
    getPipOSX(callback)
  } else {
    getPipWin(callback)
  }
}


export const getPythonOSX = (callback) => {
  const anacondaPath = `${pt.join(process.env.HOME, 'anaconda/bin/python')}`
  exec(`${anacondaPath} -V`, (error) => {
    if (!error) return callback(null, anacondaPath)
    exec('python -V', (err) => {
      if (!err) return callback(null, 'python')
      return callback(new Error('No python found.'))
    })
  })
}

export const getPythonWin = (callback) => {
  exec('python -V', (err) => {
    if (!err) return callback(null, 'python')
    return callback(new Error('No python found.'), null)
  })
}

export const getPythonPath = (callback) => {
  if (isOSX) {
    getPythonOSX(callback)
  } else {
    getPythonWin(callback)
  }
}

export const checkPythonVersion = (callback) => {
  /*
    returns callback with values 2, 3 or false
  */
  getPythonPath((err, python) => {
    if (err) callback(false)

    exec(`${python} -V`, (error, stdout, stderr) => {
      if (error) return callback(false)

      const re = /\w+\s(\d+\.\d+\.\d+)(\s+\w+)?/
      let m
      if ((m = re.exec(stderr)) !== null) { // eslint-disable-line
        if (m.index === re.lastIndex) {
          re.lastIndex++;
        }
        if (m[1][0] === '3') {
          callback('3')
        } else if (m[1][0] === '2') {
          callback('2')
        } else {
          callback(false)
        }
      } else {
        callback(false)
      }
    })
  })
}

export default checkPythonVersion
