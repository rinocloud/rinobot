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
    status: PropTypes.string,
    overflowHidden: PropTypes.bool
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
                  name: '/test/test-fixtures/1/2/test1.txt',
                  status: 'success'
                },
                {
                  name: '/test/test-fixtures/1/2/test2.txt',
                  status: 'failure',
                },
                {
                  name: '/test/test-fixtures/1/2/test3.txt',
                  status: 'active',
                }
              ]
            },
            {
              name: '/test/test-fixtures/1/test1.txt',
              status: 'ignored',
            }
          ]
        },
        {
          name: '/test/test-fixtures/rino.yaml',
          status: 'rino',
        }
      ]
    }]
  }


  constructor(props) {
    super(props)

    this.state = {
      list: this.props.list,
      overflowHidden: true
    }
  }

  render() {
    const toggleOverflow = (e) => {
      e.preventDefault()
      this.setState({ overflowHidden: !this.state.overflowHidden })
    }
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

      let bgClass = ''

      if (item.status === 'success') {
        bgClass = 'bg-success'
      }

      if (item.status === 'failure') {
        bgClass = 'bg-danger'
      }

      if (item.status === 'active') {
        bgClass = 'bg-info'
      }

      if (item.status === 'ignored') {
        bgClass = 'bg-ignored'
      }


      if (item.status === 'rino') {
        bgClass = spanStyle
      }

      const tdStyle = {
        overflow: (this.state.overflowHidden ? 'hidden' : 'visible'),
      }

      const spanStyle = {
        backgroundColor: (this.state.overflowHidden ? 'white' : '#DDA0DD'),
      }

      console.log(spanStyle)
      console.log(tdStyle)
      console.log(this.state.overflowHidden)

      return (
        <div key={status.id} >
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
                  <i className="fa fa-folder-o m-l-xs" style={{ color: '#696969' }}></i>
                  <h7 style={{ color: '#696969' }}> {'  '}
                  {pt.basename(item.name)}
                  </h7>
                </a>
                :
                <div style={{ marginLeft: `${String(this.props.indent)}px` }}>
                  <i className="fa fa-file-o"></i> {'  '}
                      {pt.basename(item.name)} {'  '}
                  {/* <h8 className={bgClass} >*/}
                  <h8 style={tdStyle}
                  >
                    {item.status === 'success' ?
                      <h8>
                        <i className={`fa fa-check ${bgClass}`}></i> {'   '}
                        <small className="text-success">Uploaded</small>
                      </h8>
                    : null}
                    {item.status === 'failure' ?
                      <div className={bgClass}>
                        <i className="fa fa-file-o"></i> {'  '}
                      {pt.basename(item.name)} {'  '}
                        <i className="fa fa-times"></i> {'   '}
                      failured
                      </div>
                    : null}
                    {item.status === 'active' ?
                      <div className={bgClass}>
                        <i className="fa fa-spinner fa-spin"></i>
                      </div>
                    : null}
                    {item.status === 'ignored' ?
                      <i className="fa fa-ban fa-fw"></i>
                    : null}
                    {item.status === 'rino' ?
                      <div
                        style={spanStyle}
                        onMouseLeave={(e) => {
                          e.preventDefault()
                          toggleOverflow(e)
                        }}
                      >
                        <i className="fa fa-cloud-upload"> </i>
                        Rinocloud uploaded
                      </div>
                    : null}
                      {/* </h8>*/}
                  </h8>
                </div>
              }

             {isOpen ?
               <div>
                 <Tree list={item.children} indent={this.props.indent + 20} />
                 <hr />
               </div>
              :
              ''
            }
          </div>
        </div>
      )
    })
    return <span>{items}</span>
  }}

module.exports = { Tree }
