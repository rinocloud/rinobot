import walk from 'fs-walk'
import mergeHistorySync from './mergeHistorySync'
import readHistorySync from './readHistorySync'
import _ from 'lodash'
import pt from 'path'

const pathBase = 'C:\\Users\\GJ\\Documents\\syncTests'
const ignoredFilter = ['.db', 'history.json']

const historyFile = pt.join(pathBase, 'history.json')
const history = readHistorySync(historyFile)


const checkIgnored = (ss, fn) => {
	let aa = []
	_(ss).forEach((value, key)=>{
		aa.push(fn.indexOf(value))
	})
	let x = (_.max(aa)>-1)?'1':'0'
	return x
}

console.log('Updating history.json file...')	

walk.walkSync(pathBase, (basedir, filename, stat) => {
   	if(stat.isFile())	{
    	//present relative path in Rinocloud format: dir1/dir2/file.ext
    	let ff = pt.relative(pathBase, pt.join(basedir, filename)).split(pt.sep).reduce((pv,cv)=>{return pv+'/'+cv})

	    new Promise((resolve, reject) => {
		    resolve(checkIgnored(ignoredFilter, filename))
	    }).then((ifIgnored) => {
		    if(!_.has(history,ff)&&ifIgnored!=1) {
		    	mergeHistorySync(historyFile, ff, {}, ()=>{console.log(ff)})
		    }
		    
		})
	
	}
})
console.log('Finished updating history.json file.')	


