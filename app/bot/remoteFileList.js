import * as api from '../api/api.js'
import _ from 'lodash'


export default (opts) => {
	const apiToken = opts.apiToken
	const id = opts.id
	api.auth(apiToken)
	api.setBase('https://rinocloud.com')
	return remoteList(id)
}
	

const remoteList = (id) => {
	let pathBase = ''
	return api
		.getAncestorsSync(id)
		.then((payload, err) => {
			_(payload).forEach((parent) => {
					let parentJSON = JSON.stringify(parent)
					parentJSON = JSON.parse(parentJSON)
					pathBase += parentJSON.name + '/'
				}
			)
			return pathBase
			}
		)
		.catch((err) => {
		    return ''
		})
		.then((pathBase) => {
			return remoteDirList(id, pathBase)
			}
		)
		.then((a) => {
			return _.flatMapDeep(a)
			}
		)
		.catch((err) => {
		    console.log(err)
		})
}

//Get file list
const remoteDirList = (id, pathBase) => {
	
	return api
		.getChildrenSync(id, 1000000, 0)
		.then((payload, err) => {
			let childrenJSON = JSON.stringify(payload)
			childrenJSON = JSON.parse(childrenJSON)
			childrenJSON = childrenJSON.result
			return Promise.all(_(childrenJSON).map((record) => {
					if(record.type === 'folder'){
						return remoteDirList(record.id, pathBase + record.name + '/')
					} 
					let ss = {}
					if(record.type === 'file'){
						//building the list here
						return {
							name : pathBase + record.name,
							id : record.id,
							created_on : record.created_on,
							etag : record.etag
							}
						/*ss[pathBase + record.name] = {
							id : record.id,
							updated_on : record.updated_on,
							etag : record.etag
						}
						return	ss
						*/
					}
				}
			))
		})
		.catch((err) => {
			console.log(err)
		})
}