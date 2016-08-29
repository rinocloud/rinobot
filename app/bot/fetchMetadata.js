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
  const noextGlobs = exts.map((ext) => fpathNoExt + ext)
  const wiextGlobs = exts.map((ext) => fpath + ext)
  const globs = noextGlobs.concat(wiextGlobs)
  const globResults = globule.find(globs)
  if (!globResults.length) { return cb(null, null) }

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
