import React, { PropTypes } from 'react'
import pt from 'path'
import _ from 'lodash'

export const Breadcrumbs = (props) => {
  const { path, basePath = false, onClick } = props
  let breadcrumbs = []
  // This is where we turn the path into a list of folders to display
  // as clickable links
  if (path) {
    breadcrumbs = _.reduce(pt.normalize(path).split(pt.sep), (collector, name) => {
      const prev = collector[collector.length - 1] ? collector[collector.length - 1].path : null

      collector.push({
        name,
        path: prev ? pt.join(prev, name) : name,
      })

      return collector
    }, [])

    // we remove the first few links to make the breadcrumbs pretty
    // we dont need the entire absolute path from the root drive
    const spliceLength = basePath ? pt.normalize(basePath).split(pt.sep).length - 1 : 1
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
              {breadcrumb.name}
            </a>
          </li>
        )
      })}
    </ol>
  )
}


Breadcrumbs.propTypes = {
  onClick: PropTypes.func.isRequired,
  path: PropTypes.string.isRequired,
  basePath: PropTypes.string,
}
