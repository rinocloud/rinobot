import _ from 'lodash'
import pt from 'path'

describe('breadcrumbs', () => {
  it('splits a path', () => {
    const path = 'C:\\Users\\eoin\\Documents\\projects\\rinobot\\app'

    const breadcrumbs = _.reduce(path.split(pt.win32.sep), (collector, name) => {
      const prev = collector[collector.length - 1] ? collector[collector.length - 1].path : '/'

      collector.push({
        name,
        path: pt.join(prev, name),
      })

      return collector
    }, [])

    console.log(breadcrumbs)
  })
})
