import _ from 'lodash'
import React, { PropTypes } from 'react'
import pt from 'path';

class Tree extends React.Component {
  /*
    add a status variable like
      'active', success', 'failure', 'ignored'

    also a variable for if the file is uploaded
  */

  static propTypes = {
    list: PropTypes.array,
    indent: PropTypes.number,
  }

  static defaultProps = {
    indent: 10,
    list: [{
      name: '/test/test-fixtures',
      open: false,
      children: [
        {
          name: '/test/test-fixtures/1',
          open: false,
          children: [
            {
              name: '/test/test-fixtures/1/2',
              open: false,
              children: [
                {
                  name: '/test/test-fixtures/1/2/test1.txt'
                },
                {
                  name: '/test/test-fixtures/1/2/test2.txt'
                },
                {
                  name: '/test/test-fixtures/1/2/test3.txt'
                }
              ]
            },
            {
              name: '/test/test-fixtures/1/test1.txt'
            }
          ]
        },
        {
          name: '/test/test-fixtures/rino.yaml'
        }
      ]
    }]
  }


  constructor(props) {
    super(props)

    this.state = {
      list: this.props.list
    }
  }

  render() {
    const onClickFolder = (index) => {
      const listCopy = _.clone(this.state.list)
      listCopy[index].open = !listCopy[index].open
      this.setState({
        list: listCopy
      })
    }

    const items = _.map(this.state.list, (item, index) => {
      const isFolder = _.has(item, 'children')
      const isOpen = item.open

      return (
        <div>
          <div>
              {isFolder ?
                <a
                  className="btn btn-sm"
                  style={{ marginLeft: `${String(this.props.indent)}px` }}
                  onClick={(e) => {
                    e.preventDefault()
                    onClickFolder(index)
                  }}
                >
                  <i className="fa fa-folder-o m-l-xs"> </i>
                  {pt.basename(item.name)}
                  <a>   stuatus</a>
                  <a>  stuatus</a>
                </a>
                :
                <span
                  style={{ marginLeft: `${String(this.props.indent)}px` }}
                >
                  <i className="fa fa-file-o"></i>
                  {pt.basename(item.name)}
                </span>
              }
             {isOpen ?
              <Tree list={item.children} indent={this.props.indent + 20} />
              :
              ''
            }
          </div>
        </div>
      )
    })


    return <span>{items}</span>
  }
}

module.exports = { Tree }
