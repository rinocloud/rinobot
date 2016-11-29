import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import pt from 'path'
import * as notebookActions from '../actions/notebook'
import { MarkdownRenderer } from '../components/MarkdownRenderer'
import { MarkdownEditor } from '../components/MarkdownEditor'
import { Button } from '../components/Button'

class Notebook extends React.Component {
  static propTypes = {
    notebook: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch(notebookActions.load())
  }

  render() {
    const { notebook, dispatch } = this.props

    return (
      <div>
        <div className="main config">
          <div className="panel panel-primary">
            <div className="panel-heading">

              <a
                href="#"
                className="btn btn-sm btn-default m-r"
              >
                <i className="fa fa-arrow-left m-r-sm" />Back
              </a>

              {pt.basename(notebook.currentFilePath)}

              {notebook.state === 'previewing' &&
                <Button
                  extraClassNames="btn btn-default m-l"
                  onClick={() => dispatch(notebookActions.setEditing())}
                >
                  Edit
                </Button>
              }

              {notebook.state === 'editing' &&
                <Button
                  extraClassNames="btn btn-default m-l"
                  onClick={() => dispatch(notebookActions.setPreviewing())}
                >
                  Preview
                </Button>
              }

            </div>
            <div className="panel-body">
              {notebook.state === 'previewing' &&
                <MarkdownRenderer content={notebook.contents} />
              }
              {notebook.state === 'editing' &&
                <MarkdownEditor
                  initialValue={notebook.contents}
                  onChange={(value) => {
                    dispatch(notebookActions.setContents(value))
                  }}
                />
              }

              {notebook.state === 'editing' &&
                <Button
                  extraClassNames="btn btn-default m-l"
                  onClick={() => dispatch(notebookActions.save())}
                >
                  Save
                </Button>
              }

            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  notebook: state.notebook
})

export default connect(mapStateToProps)(Notebook)
