import fs from 'fs'
import pt from 'path'
import yaml from 'js-yaml'
import omit from 'lodash/omit'

const defaultConfig = {
  apiToken: null,
  uploadTo: '',
  base: 'https://rinocloud.com',
  metadataExtensions: ['.toml', '.json', '.yaml', '.yml'],
  ignore: ['*.json', '*.yaml', '*.toml', '*.rino', 'rino.yaml', 'rino.json', '.rino/*', '*~']
}

export default function (watchPath, callback) {
  fs.readFile(pt.join(watchPath, 'rino.yaml'), (err, data) => {
    if (err) return callback(null)
    const userOptions = yaml.safeLoad(data)
    userOptions.ignore = userOptions.ignore || []
    const options = {
      ...defaultConfig,
      ignore: [
        ...defaultConfig.ignore,
        ...userOptions.ignore
      ],
      ...omit(userOptions, 'rules', 'ignore'),
      rules: userOptions.rules || []
    }

    return callback(options)
  })
}
