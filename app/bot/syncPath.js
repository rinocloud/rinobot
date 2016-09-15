import remoteFileList from './remoteFileList'
import mergeHistory from './mergeHistory'
import readHistory from './readHistory'
import * as api from '../api/api.js'
import _ from 'lodash'
import fs from 'fs'
/*
new Promise((resolve, reject) => {
		resolve(remoteFileList(
			{
				//id:null, 
				id: 8619,
				apiToken:'70f9151d2ea2838951b478dade498766cfa9d969'
			}
		))
	}
).then((list) => {
		//do stuff with the list
		//console.log(list)
		//	1. Check if history file reflects locally watched folder file tree
		//	2. Iterate through remot file list
		//	3. If file not in the list, download, mergeHistory
		//mergeHistory('history.json', 'test/dir1/op.txt',list,()=>{console.log(list)})
		//_(list).forEach((value) => {readHistory('history.json', value.name, (err, tt)=>{console.log(err, tt)})})
		//_(list).forEach((value)=>{console.log(value.name)})

	}
).catch((reason) => {
		console.log(reason)
	}
)
*/

//Downloading file:
api.auth('70f9151d2ea2838951b478dade498766cfa9d969')
api.setBase('https://rinocloud.com')
let buf = ''
api
.s3_download(3123, (err, res)=>{
	console.log(res.headers)
	let metadata = JSON.stringify(res.header)
	metadata = JSON.parse(metadata)
	console.log(metadata['rinocloud-api-result'])
	res.on('data', (chunk) => { 
		buf += chunk })
	res.on('end', ()=>{
	 	//let stream = fs.createWriteStream('resp.png')
 		//stream.write(buf)
   	 	console.log(buf)
   	})
})

