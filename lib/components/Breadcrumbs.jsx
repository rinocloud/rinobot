import React, { PropTypes } from 'react'
import pt from 'path'
import _ from 'lodash'

export class Breadcrumbs extends React.Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    path: PropTypes.string.isRequired,
    basePath: PropTypes.string,
  }

  render() {
    const { path, basePath = true, onClick } = this.props
    let breadcrumbs = []


    // This is where we turn the path into a list of folders to display
    // as clickable links
    if (path) {
      breadcrumbs = _.reduce(path.split(pt.sep), (collector, name) => {
        const prev = collector[collector.length - 1] ? collector[collector.length - 1].path : '/'

        collector.push({
          name,
          path: pt.join(prev, name),
        })

        return collector
      }, [])

      // we remove the first few links to make the breadcrumbs pretty
      // we dont need the entire absolute path from the root drive
      const spliceLength = basePath ? basePath.split(pt.sep).length - 1 : 1
      breadcrumbs = breadcrumbs.splice(spliceLength)
    }

    return (
      <ol className="breadcrumb breadcrumbs m-b-0">
        {_.map(breadcrumbs, (breadcrumb, index) => {
          return (
            <li key={`bread${index}`}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onClick(breadcrumb.path)
                }}
              >
                <i className="fa fa-folder-open-o" />
                {breadcrumb.name}
              </a>
            </li>
          )
        })}
      </ol>
    )
  }
}


export default { Breadcrumbs }
