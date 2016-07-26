# Rinobot.js

Rinocloud lets you schedule tasks when files are created. Its useful for
processing data automatically if your doing experiments or simulations.

This is the command line version of the program, not to be confused with the
full [rinobot app](https://github.com/rinocloud/rinobot).

## Getting started

Install from npm - you'll need [node](http://nodejs.com) and npm installed

```bash
npm install rinobot -g
```

To run `rinobot` just type:

```bash
rinobot path/to/watch/
```

rinobot will then check the path for a `rino.yaml` file. If it exists it will
start watching.

## rino.yaml

The rino.yaml file describes the tasks you want done when a file appears in the
watched directory.

We call these collection of tasks a pipeline. When a file is created, it will be
run through the pipeline. If any of the tasks in the pipeline fail, we will
queue the pipeline and try it again later.

### example

Here is a simple example that uploads all `.txt` files that appear in a
directory

```yaml
apiToken: 8186755009251ef0bbb273fbc86d7b9caa228374

tasks:
  - match: "*.txt"
    command: "rinocloud-upload"
    on: add
```

And here is an example that calls the `python` script `plot.py` and plots the
data and the uploads the `.txt` and `.png` file.

```yaml
apiToken: 8186755009251ef0bbb273fbc86d7b9caa228374

ignore:
  - "*.py"

tasks:
  - match: "*.txt"
    command: "python"
    args: "plot.py {{filepath}}"

  - match: "*.txt"
    command: "rinocloud-upload"
    on: add

  - match: "*.png"
    command: "rinocloud-upload"
    on: add
```

Here is the `plot.py` file:

```python
import sys
import numpy as np
import matplotlib.pyplot as plt

fpath = sys.argv[1]
data =  np.loadtxt(fpath)

plt.imshow(data, extent=[0, 100, 0, 1], aspect='auto')
plt.savefig(fpath.replace('.txt', '.png'))
```

## development

This section is only relevant if you want to integrate rinobot with your javascript codebase or
to develop rinobot itself.

To get setup run

```
npm install
```

And to start testing run

```
npm run test
```

All the source code lives in `src/`, the source is all es6 javascript, so it
needs to be transpiled before we can distribute. So run `npm run build` to
create the library is the `dist/` folder.

### example

```javascript
const watchPath = 'some/dir'

const w = watcher
  .getChokidar()
  .watch(watchPath)
  .on('all', (event, path, stats) => {
    var p = new pipeline.Pipeline({
      path,
      event,
      watchPath,
      on_complete: function(pipeline){ console.log(pipeline.relPath + ' done') }
      on_log: function(pipeline, msg){ console.log(pipeline.relPath + ' ' + msg) }
    })
  })
```

### pipeline

```javascript
import {pipeline} from 'rinobot'
const p = new pipeline.Pipeline(options)
```

`options` has three required properties

- `event: String`, the name of the event given by chokidar
- `path: Path`, the path given by the chokidar event
- `watchPath: Path`, the path of the root directory being watched

`options` has some optional properties

- `on_complete: function(pipeline)`, called when the entire pipeline completes successfully
- `on_error: function(pipeline, err)`, called if the pipeline fails to complete - the pipeline will abort before the error is thrown
- `on_ignore: function(pipeline)`, called if the pipeline ignores the file
- `on_log: function(pipeline, message)`, general log for entire pipeline
- `on_task_complete: function(pipeline, task, err)`, called when a task completes
- `on_task_error: function(pipeline, task)`, called when a task fails - the pipeline will abort
- `on_task_ignore: function(pipeline, task)`, called if the task has already been completed, or ignored for some other reason
- `api: rinocloud-javascript api instance`, defaults to making its own instance

### task

```javascript
import {task} from 'rinobot'
const t = new task.Task(options)
```

A task will run on a schedule in series. And a group of tasks in a pipeline will
all run in series with respect to all the other pipeline tasks.

If a pipeline fails, its tasks are removed from the queue and then there is a
timeout and the pipeline is put to the end of the queue again.

### watcher

```javascript
import {watcher} from 'rinobot'
```

Chokidar is the library we use to monitor files, and we have a specific
functions `getChokidar` to get the chokidar instance, this is because sometimes
the pipelines and watcher operate in different process threads (for example in
an electron.js application).

```javascript
const chokidar = watcher.getChokidar()
```

Add a watcher to the list of watchers

```javascript
watcher.addWatch(watch)
```

Close all the watchers

```javascript
watcher.close()
```

Close a specific watcher by index

```javascript
watcher.closeByIndex(index)
```

### Rinobot.js event specification

#### Chokidar events:
1. add
	* Triggered upon creating file, renaming file, renaming one of the parent folders, moving parent folder, moving file
2. unlink
	* Triggered upon deleting file, renaming file, renaming one of the parent folders, moving parent folder, moving file
3. addDir
	* Triggered upon creating folder, renaming folder, renaming one of the parent folders, moving parent folder
4. unlinkDir
	* Triggered upon deleting folder, renaming folder, renaming one of the parent folders, moving parent folder
5. change
	* Upon overwriting

#### User actions:
1. Create folder (addDir event)
2. Create file (add event)
3. Delete folder (unlinkDir or crashing program)
4. Delete file (unlink event)
5. Rename folder (unlinkDir + addDir events + multiple unlink, add, unlinkDir, addDir events for subfolders and files within)
6. Rename file (unlink + add events)
7. Change file (change event)
8. Move folder (unlinkDir + addDir events  + multiple unlink, add, unlinkDir, addDir events for subfolders and files within).
9. Move file (unlink + add events)

#### Discriminating user actions:
1. No previously triggered unlink or unlinkDir event within 1 or 2 sec - create file or folder
2. No following triggered add oraddDir event within 1 or 2 sec - delete file or folder
3. If sequent unlink + add (issue: the order is not necessarily the same) triggered, can be:
	* Renamed file (how to discriminate: events only two, the same base path)
	* Renamed parent folder (Accompanied by at least unlinkDir + addDir. If the file is within modified folder path, only the modified folder has to be updated).
	* Moved file (Events only two, different base path, file name the same. Issue: multiple files moved)
	* Moved parent folder (Accompanied by at least unlinkDir + addDir. If the file is within modified folder path, only the top modified folder has to be updated)
3. If sequent unlinkDir + addDir (the order is not necessarily the same) triggered, can be:
	* Renamed folder (find the top)
