import _ from 'lodash'

export let checkIgnored = (ss, fn) => {
	let aa = []
	_(ss).forEach((value, key)=>{
		aa.push(fn.indexOf(value))
	})
	let x = (_.max(aa)>-1)?'1':'0'
	return x
}