import * as api from '../api/api.js'
import { mergeHistory, readHistory } from './history'
import pt from 'path'

export default (opts, id, remoteFilePath, cb) => {
	const apiToken = opts.apiToken
	const historyFile = opts.historyFile
	const localPathBase = opts.localPathBase
	const ignoredFilter = opts.ignoredFilter
	readHistory(historyFile, (history) => {
		const uploadInfo = {name: remoteFilePath, previousVers: id}

		const fpath = pt.join(localPathBase, remoteFilePath.split('/').reduce((pv,cv)=>{return pt.join(pv, cv)}))
		const relFpath = pt.relative(localPathBase, fpath).split(pt.sep).reduce((pv,cv)=>{return pv+'/'+cv})

		api.auth(apiToken)
		api.setBase('https://rinocloud.com')

		const progress = (total, loaded) => {
		  const p = loaded*100/total
		  console.log(`${p.toFixed(2)}%`)
		}

		const complete = (res) => {

			const fileInfo = JSON.parse(res.text)

			let vers = history[relFpath].versions
			const fileStats = {
			  	lastUpdate: fileInfo.created_on,
			  	etag: fileInfo.etag,
			    versions: [...vers, fileInfo.metadata.previousVers],
			    id: fileInfo.id
			}
			  mergeHistory(historyFile, relFpath, fileStats, ()=>{console.log('Replacing: ' + fileInfo.name)})

		}

		const error = (err) => {
		  console.log(err)
		}

		api.
			deleteObject(id).
			then((payload)=>{
				api.
				s3uploadElectron(fpath, uploadInfo, progress, error, complete)
			}).
			catch(error)

		cb()
	})

}
