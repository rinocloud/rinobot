import React, { PropTypes } from 'react'
import pt from 'path'
import _ from 'lodash'

export class Breadcrumbs extends React.Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    path: PropTypes.string.isRequired,
  }

  render() {
    const { path, onClick } = this.props
    let breadcrumbs = []

    if (path) {
      breadcrumbs = _.reduce(path.split(pt.sep), (collector, p) => {
        const prev = collector[collector.length - 1] ? collector[collector.length - 1].path : '/'

        collector.push({
          name: p,
          path: pt.join(prev, p),
        })
        return collector
      }, []).splice(1)
    }

    return (
      <ol className="breadcrumb m-b-0">
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
}
