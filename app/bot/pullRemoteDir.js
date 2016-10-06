import remoteFileList from './remoteFileList'
import mergeHistorySync from './mergeHistorySync'
import readHistorySync from './readHistorySync'
import updateHistorySync from './updateHistorySync'
import replaceFile from './replaceFile'
import * as api from '../api/api.js'
import {checkIgnored} from './filters'
import _ from 'lodash'
import fs from 'fs'
import downloadFileSync from './downloadFileSync'
import pt from 'path'
import moment from 'moment'


const apiToken = '70f9151d2ea2838951b478dade498766cfa9d969'
const pathBase = 'C:\\Users\\GJ\\Documents\\syncTests'
const watchedDirId = 3120 //null for root; 3120
const ignoredFilter = ['.db', 'history.json'] //exact matches

const historyFile = pt.join(pathBase, 'history.json')
const opts = {apiToken:apiToken, historyFile:historyFile, localPathBase:pathBase, ignoredFilter:ignoredFilter}

console.log('Updating history file locally.')
updateHistorySync(opts, () => {
	const history = readHistorySync(historyFile)
	console.log('History file was updated locally.')
	
	console.log('Downloading remote file list.')
	new Promise((resolve, reject) => {
			resolve(
				remoteFileList({id:watchedDirId,apiToken:apiToken})
			)
	}).then((list) => {
			console.log('Downloading files.')
			_(list).forEach((value, key) => {
				try {
					const fileInfo = JSON.parse(JSON.stringify(value))

					let ifIgnored = checkIgnored(ignoredFilter, fileInfo.name.split(/[/ ]+/).pop())
					if(ifIgnored!=1)	{
						if(!_.has(history,fileInfo.name)) {
							let fileStats = {
								createdOn: fileInfo.created_on,
								lastSynchronization: fileInfo.created_on,
								lastUpdate: fileInfo.created_on,
								etag: fileInfo.etag,
								versions: [],
								id: fileInfo.id
							}
							downloadFileSync(opts, fileInfo, ()=>{
								mergeHistorySync(historyFile, fileInfo.name, fileStats, ()=>{console.log('Downloading and updating history.json: ' + fileInfo.name)})})
						}	else	{
								if(history[fileInfo.name].etag!=fileInfo.etag||history[fileInfo.name].createdOn!=fileInfo.created_on)	{
									//check sync and upload or download, update history sync time, id. 
									//If upload -> delete file, upload with previous version id, save 
									if(fileInfo.created_on<history[fileInfo.name].lastUpdate)	{
										console.log('Upload updated:' + fileInfo.name)
										//might need to add queues 
										replaceFile(opts, fileInfo.id, fileInfo.name, ()=>{console.log('replaced')})
									}
								}
							
						}
					}
				} catch (err) {
					console.log('Parsing error:' + err)
				}
			})
			console.log('Finished downloading files.')
		}
	).catch((reason) => {
			console.log(reason)
		}
	)
	
})
