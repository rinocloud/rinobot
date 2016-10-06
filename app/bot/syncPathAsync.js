import remoteFileList from './remoteFileList'
import mergeHistory from './mergeHistory'
import readHistory from './readHistory'
import * as api from '../api/api.js'
import _ from 'lodash'
import fs from 'fs'
import downloadFile from './downloadFile'
import pt from 'path'



const apiToken = '70f9151d2ea2838951b478dade498766cfa9d969'
const pathBase = 'C:\\Users\\GJ\\Documents\\syncTests'
const watchedDirId = null //null for root 3120

const historyFile = pt.join(pathBase, 'history.json')
const opts = {apiToken:apiToken, historyFile:historyFile, localPathBase:pathBase}
	
new Promise((resolve, reject) => {
		resolve(
			remoteFileList({id:watchedDirId,apiToken:apiToken})
		)
}).then((list) => {
		//do stuff with the list
		//	1. Check if history file reflects locally watched folder file tree
		//	2. Iterate through remot file list
		//	3. If file not in the list, download, mergeHistory
		//_(list).forEach((value) => {readHistory('history.json', value.name, (err, tt)=>{console.log(err, tt)})})
		
		//_(list).forEach((value, key) => {
		//list.forEach((value, key) => {
		let i
		const len = list.length
		for (i = 0, len; i < len; i++) {
			console.log(list[i])
			const fileInfo = JSON.parse(JSON.stringify(list[i]))
			readHistory(historyFile, fileInfo.name, (err, localFile)=>{
				if(localFile === null)	{
					downloadFile(opts, fileInfo, ()=>{
					mergeHistory(historyFile, fileInfo.name, fileInfo, ()=>{console.log(len+'/'+i)})
					})
				}
			})	
		}
		//})

	}
).catch((reason) => {
		console.log(reason)
	}
)
