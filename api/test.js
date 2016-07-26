
import * as api from './src/api.js'
api.auth('<token>')
api.setBase('https://rinocloud.com')

import fs from 'fs'
import pt from 'path'

const progress = (total, loaded) => {
  const p = loaded*100/total
  console.log(`${p.toFixed(2)}%`)
}

const complete = (res) => {
  console.log('complete')
}

const error = (err) => {
  console.log(err)
}

const fpath = pt.join(__dirname, 'test.txt')

let text = ''

for (var i = 0; i < 1000000; i++) {
    text += i + "\n";
}

fs.writeFileSync(fpath, text)
api.s3uploadElectron(fpath, {name: 'test.txt'}, progress, error, complete)
fs.unlinkSync(fpath)
