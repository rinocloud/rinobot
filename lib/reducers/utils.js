import _ from 'lodash'

export const createConfig = (config) => {
  let metadata = [{ field: '', value: '' }]
  let copy = {}

  if (config) {
    copy = _.cloneDeep(config)
    if (_.isPlainObject(copy.metadata)) {
      // metadata is a plain object when we read it from the rino.yaml file
      // we map it to an array like metadata = [{field: 'x', value: 'y'}]
      // this is so that we can allow the user to edit the field, value pairs
      // its almost impossible to let the user edit it if its just an object
      metadata = _.map(copy.metadata, (value, field) => ({ field, value }))
      copy = _.omit(copy, 'metadata')
    }
  }

  const newConfig = {
    tasks: [],
    metadata,
    ...copy,
  }
  return newConfig
}
