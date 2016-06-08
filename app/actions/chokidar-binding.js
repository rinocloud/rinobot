var chokidar = require('chokidar')

export const getChokidar = () => {
  return chokidar
}

export let watchers = []

export const addWatch = (w) => {
  watchers.push(w)
}

export const close = () => {
  console.log(`Closing ${watchers.length} watchers`)
  watchers.forEach((w) => {
    w.close()
  })
  watchers = []
}
