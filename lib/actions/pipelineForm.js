import { createAction } from 'redux-actions'


export const setForm = createAction('PIPELINE_FORM_SET')


export const addPipeline = createAction('PIPELINE_FORM_ADD_PIPELINE')


export const removePipeline = createAction('PIPELINE_FORM_REMOVE_PIPELINE')


export const addPipelineTask = createAction('PIPELINE_FORM_ADD_PIPELINE_TASK')


export const removePipelineTask = createAction('PIPELINE_FORM_REMOVE_PIPELINE_TASK')


export const changePipelineFilematch = createAction('PIPELINE_FORM_CHANGE_PIPELINE_MATCH')


export const changePipelineTaskName = createAction('PIPELINE_FORM_CHANGE_PIPELINE_TASK_NAME')


export const changePipelineTaskArgs = createAction('PIPELINE_FORM_CHANGE_PIPELINE_TASK_ARGS')


export const changePipelineTaskKeep = createAction('PIPELINE_FORM_CHANGE_PIPELINE_TASK_KEEP')


export const changePipelineTaskFlow = createAction('PIPELINE_FORM_CHANGE_PIPELINE_TASK_FLOW')


export const changePipelineIncomingOnly = createAction('PIPELINE_FORM_CHANGE_PIPELINE_INCOMING_ONLY')


export const addMetadata = createAction('PIPELINE_FORM_ADD_METADATA')


export const removeMetadata = createAction('PIPELINE_FORM_REMOVE_METADATA')


export const changeMetadataField = createAction('PIPELINE_FORM_CHANGE_METADATA_FIELD')


export const changeMetadataValue = createAction('PIPELINE_FORM_CHANGE_METADATA_VALUE')
