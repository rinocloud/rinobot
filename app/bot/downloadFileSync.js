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

	try {
		mkdirp.sync(absDirPath)
		api
		.s3_download(id, (err, res)=>{
			const fp = pt.join(absDirPath, fileName)
			try {
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
		   	} catch(err) {
		   		console.log('Error saving: '+fp)
		   		fs.unlink(fp, (err)=>{if (err) return console.error("error unlink:", err)})
		   	}
		})
	} catch (err) {
		console.log('mkdirp.sync error:' + err)
	}
}