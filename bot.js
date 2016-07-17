
export default function (rpc) {
  rpc.on('watch', (path) => {
    console.log(path)
  })

  rpc.on('unwatch', (path) => {
    console.log(path)
  })
}


/*

example watch code

const w = chokidar.getChokidar()
  .watch(dir.path, {
    ignored: ['**.rino\/**', '**\/.rino'],
    ignoreInitial: false,
    usePolling: true
  })
  .on('add', (path) => {
    const p = new Pipeline({ // eslint-disable-line
      watchPath: dir.path,
      event: 'add',
      path,
      on_log: (pipeline, msg) => {
        setTimeout(() => {
          log(`${pipeline.relPath}: ${msg}`)
          dispatch(setBusy(index))
        })
      },
      on_complete: (pipeline) => {
        setTimeout(() => {
          if (!pipeline.ignored) {
            log(`${pipeline.relPath}: complete`)
          }
          dispatch(unsetBusy(index))
        })
      },
      on_error: (pipeline, error) => {
        setTimeout(() => {
          log(`${pipeline.relPath}: ${error.message}`)
          setTimeout(() => {
            dispatch(unsetBusy(index))
          }, 1000)
        })
      },
    })

    paths.push(path)
  })
  .on('ready', () => {
    const end = performance.now()
    const time = end - start;
    log(`Indexed ${Object.keys(w.getWatched()).length} directories in: ${time.toFixed(2)} ms`);
  })
chokidar.addWatch(w)

*/
