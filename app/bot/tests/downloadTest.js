import mergeHistorySync from '../mergeHistorySync'
import readHistorySync from '../readHistorySync'
import * as api from '../../api/api.js'
import _ from 'lodash'
import fs from 'fs'
import downloadFileSync from '../downloadFileSync'
import pt from 'path'

const apiToken = '70f9151d2ea2838951b478dade498766cfa9d969'
const pathBase = 'C:\\Users\\GJ\\Documents\\syncTests'
const watchedDirId = 3889 //null for root 3120

const historyFile = pt.join(pathBase, 'history.json')
const history = readHistorySync(historyFile)

const opts = {apiToken:apiToken, historyFile:historyFile, localPathBase:pathBase}

const fileInfo = {name : 'abc/test/123.png', id : 3366}
downloadFileSync(opts, fileInfo, ()=>{})