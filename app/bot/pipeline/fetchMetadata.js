import fs from 'fs-extra'
import pt from 'path'
import globule from 'globule'
import yaml from 'js-yaml'

const getParser = (ext) => {
  if (ext === '.json') return JSON.parse
  if (ext === '.yaml') return yaml.safeLoad
  if (ext === '.yml') return yaml.safeLoad
  return null
}

const exts = ['.json', '.yaml', '.yml']

export default (fpath, cb) => {
  const fpathNoExt = fpath.substr(0, fpath.lastIndexOf('.'))
  const globs = [].concat(
    exts.map((ext) => fpathNoExt + ext),
    exts.map((ext) => fpath + ext),
    exts.map((ext) => pt.join(pt.dirname(fpathNoExt), `.${pt.basename(fpathNoExt)}${ext}`)),
    exts.map((ext) => pt.join(pt.dirname(fpathNoExt), `.${pt.basename(fpathNoExt)}${ext}`)),
  )

  const globResults = globule.find(globs)

  if (!globResults.length) {
    console.log('Didnt find anything')
    return cb(null, null)
  }

  if (globResults.length > 1) {
    return cb(
      new Error(`${globResults.length} conflicting metadata files. Should only be one.`),
      null
    )
  }

  const metadataFilePath = globResults[0]
  const parser = getParser(pt.extname(metadataFilePath))

  fs.readFile(metadataFilePath, 'utf-8', (err, data) => {
    if (err) return cb(err, null)
    const metadata = parser(data)

    cb(null, metadata)
  })
}
