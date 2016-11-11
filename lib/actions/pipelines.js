import { createAction } from 'redux-actions'
import mixpanel from 'mixpanel-browser'
import _ from 'lodash'
import db from './db'


export const setPipelines = createAction('PIPELINES_SET')


export const hydrate = () => (dispatch) => {
  db.pipelines.find({}, (err, docs) => {
    if (docs) dispatch(setPipelines(docs))
  })
}


export const addPipeline = (name) => (dispatch, getState) => {
  const payload = {
    name,
    ..._.omit(getState().pipelineForm, 'isSaved')
  }

  mixpanel.track('Save pipeline', {
    name,
    'Task Names': getState().pipelineForm.pipelines[0]
  })

  dispatch(createAction('PIPELINES_ADD')(payload))

  db.pipelines.update({ name },
    payload, {
      upsert: true
    }, (err) => {
      if (err) throw err
    })
}
