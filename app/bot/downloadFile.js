import * as api from '../api/api.js'
import fs from 'fs'
import pt from 'path'
import mkdirp from 'mkdirp'

export default (opts, remoteFileInfo, cb) => {
	const apiToken = opts.apiToken
	const historyFile = opts.historyFile
	const localPathBase = opts.localPathBase
	const id = remoteFileInfo.id
	const filePath = remoteFileInfo.name

	api.auth(apiToken)
	api.setBase('https://rinocloud.com')
	const remotePathBase = pt.dirname(filePath).split('/')
	const fileName = pt.basename(filePath)
	const absDirPath = pt.join(localPathBase, remotePathBase.reduce((pv,cv)=>{return pt.join(pv, cv)}))

	mkdirp(absDirPath, (error) => {
		api
		.s3_download(id, (err, res)=>{
			//console.log(res.headers)
			//const metadata = JSON.parse(JSON.stringify(res.header))
			//const rinoMetadata = JSON.parse(metadata["rinocloud-api-result"])
			
			const fp = pt.join(absDirPath, fileName)
			let stream = fs.createWriteStream(fp)
			res.on('data', (chunk) => { 
				stream.write(chunk)
			})
			res.on('end', ()=>{
		 		stream.end()
		 		cb(null)
		   	})
		   	res.on('error', ()=>{
			 	console.log('File download error')
			})
		})
	})
}