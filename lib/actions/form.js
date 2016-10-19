/*
  * form action
*/
import { createAction } from 'redux-actions'


export const setForm = createAction('FORM_SET')


export const addPipeline = createAction('FORM_ADD_PIPELINE')


export const removePipeline = createAction('FORM_REMOVE_PIPELINE')


export const addPipelineTask = createAction('FORM_ADD_PIPELINE_TASK')


export const removePipelineTask = createAction('FORM_REMOVE_PIPELINE_TASK')


export const changePipelineFilematch = createAction('FORM_CHANGE_PIPELINE_MATCH')


export const changePipelineTaskName = createAction('FORM_CHANGE_PIPELINE_TASK_NAME')


export const changePipelineTaskArgs = createAction('FORM_CHANGE_PIPELINE_TASK_ARGS')


export const changePipelineTaskKeep = createAction('FORM_CHANGE_PIPELINE_TASK_KEEP')


export const changePipelineTaskFlow = createAction('FORM_CHANGE_PIPELINE_TASK_FLOW')


export const changePipelineIncomingOnly = createAction('FORM_CHANGE_PIPELINE_INCOMING_ONLY')


export const addMetadata = createAction('FORM_ADD_METADATA')


export const removeMetadata = createAction('FORM_REMOVE_METADATA')


export const changeMetadataField = createAction('FORM_CHANGE_METADATA_FIELD')


export const changeMetadataValue = createAction('FORM_CHANGE_METADATA_VALUE')
