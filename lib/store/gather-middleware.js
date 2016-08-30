import clone from 'lodash/clone'

const requestTimeout = function(fn, delay) {
	var start = new Date().getTime(),
		handle = new Object();

	function loop(){
		var current = new Date().getTime(),
			delta = current - start;

		delta >= delay ? fn.call() : handle.value = requestAnimationFrame(loop);
	};

	handle.value = requestAnimationFrame(loop);
	return handle;
};

/**
 * Behaves the same as clearTimeout except uses cancelRequestAnimationFrame() where possible for better performance
 * @param {int|object} fn The callback function
 */
const clearRequestTimeout = function(handle) {
  cancelAnimationFrame(handle.value)
};


export default function middleware () {
  let timers = {}
  let holders = {}
  let last = {}

  return () => (next) => (action) => {
    const {
      meta: { gather={} }={},
      type
    } = action

    const {
      time,
      key
    } = gather

    const waitType = gather.type || 'debounce'

    const shouldGather = (time && type)
    if (!shouldGather) {
      return next(action)
    }

    if (timers[type]) {
      clearRequestTimeout(timers[type])
    }

    if (key){
      if (!holders.hasOwnProperty(type)) {
        holders[type] = []
      }
      holders[type].push(...action.payload[key])
    }

    const now = (new Date()).getTime()
    const processTask = () => {
      const payload = clone(action.payload)
      if (key) {
        payload[key] = holders[type]
      }
      next({
        type,
        payload,
      })
      holders[type] = []
      last[type] = now
    }

    if (waitType === 'debounce'){
      return timers[type] = requestTimeout(processTask, time)
    }

    if (waitType === 'throttle' && last[type] && now < last[type] + time) {
      return timers[type] = requestTimeout(processTask, time)
    } else {
      last[type] = now
      processTask()
    }
  }
}
