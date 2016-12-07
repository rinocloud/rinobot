import React, { PropTypes } from 'react'
import jsondiffpatch from 'jsondiffpatch'
import { connect } from 'react-redux'
import pt from 'path'
import _ from 'lodash'
import { Button } from '../components/Button'
import { Prompt } from '../components/Prompt'
import { MetadataForm } from '../components/MetadataForm'
import { LoadMetadataTemplate } from '../components/LoadMetadataTemplate'
import { change, reset } from 'redux-form'


const metadataArrayToObject = (metadataArray) => {
  return _.chain(metadataArray).keyBy('key').mapValues('value').value() // eslint-disable-line
}


const metadataObjectToArray = (metadataObject) => {
  return _.map(metadataObject, (value, key) => ({ key, value }))
}


class MetadataShelf extends React.Component {

  static propTypes = {
    files: PropTypes.object,
    templates: PropTypes.object,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onSaveTemplate: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
  }

  prepareMetadata() {
    const { files } = this.props
    // an array of the metadata for each file
    const metadataArray = _.map(files, (value) => value)
    // we reduce this down to the common metadata for each file
    const initialMetadataObject = _.reduce(metadataArray, (result, item) => {
      if (_.isEmpty(result)) {
        return _.assign({}, item)
      }
      return _.transform(item, (common, value, key) => {
        if (result[key] === value) {
            common[key] = value // eslint-disable-line
        }
      }, {})
    }, {})
    return initialMetadataObject
  }

  prepareTitle() {
    const { files } = this.props

    let filePathTitle = 'Multiple Files'
    if (_.keys(files).length === 1) {
      filePathTitle = _.toPairs(files)[0][0]
    }

    return filePathTitle
  }

  render() {
    const {
      onSave,
      onClose,
      onSaveTemplate,
      templates,
      dispatch,
      // eslint-disable-line
    } = this.props

    const filePathTitle = this.prepareTitle()

    const initialMetadataObject = this.prepareMetadata()

    const onSubmit = (values) => {
      const newMetadataArray = values.metadataArray
      const newMetadataObject = metadataArrayToObject(newMetadataArray)

      const diff = jsondiffpatch.diff(initialMetadataObject, newMetadataObject)
      onSave(initialMetadataObject, newMetadataObject, diff)
    }


    const onSubmitTemplatePrompt = (name) => {
      const formState = metadataArrayToObject(this._form.values.metadataArray)
      onSaveTemplate(name, formState)
    }

    let initialMetadata = metadataObjectToArray(initialMetadataObject)
    if (initialMetadata.length === 0) {
      initialMetadata = [{ key: '', value: '' }, { key: '', value: '' }]
    }


    return (
      <div className="metadata-shelf config">
        <div className="panel panel-primary">
          <div className="panel-heading ">
            <Button
              onClick={onClose}
              extraClassNames="btn btn-xs btn-default m-r pull-right"
            >
              <i className="fa fa-remove" />
            </Button>
            <i className="fa fa-tag" /> {pt.basename(filePathTitle)}
          </div>
          <div className="panel-body">
            <div className="row">
              <MetadataForm
                onSubmit={onSubmit}
                ref={(c) => { this._form = c }}
                initialValues={{ metadataArray: initialMetadata }}
              />
              <div className="col-sm-3 col-sm-offset-7">
                <LoadMetadataTemplate
                  key={`temp-${filePathTitle}`}
                  templates={templates}
                  onSelect={(template) => {
                    const formState = metadataArrayToObject(this._form.values.metadataArray)
                    const newValues = metadataObjectToArray({
                      ...template,
                      ...formState
                    })

                    dispatch(change('metadataForm', 'metadataArray', newValues))
                  }}
                />

              </div>
            </div>
            <div className="row">
              <div className="col-sm-6 col-sm-offset-4 m-t">
                <Prompt
                  onSubmit={onSubmitTemplatePrompt}
                  title="This will save the current metadata form as a template to be used later"
                  placeholder="Template name"
                  extraClassNames="btn btn-sm btn-default m-l-sm pull-right"
                >
                  Save as template
                </Prompt>
                <Button
                  extraClassNames="pull-right"
                  onClick={() => {
                    dispatch(reset('metadataForm'))
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  form: state.form,
})


export default {
  MetadataShelf: connect(mapStateToProps)(MetadataShelf)
}
