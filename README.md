
# Rinobot

This is the interface for the command line program [rinobot.js](https://github.com/rinocloud/rinobot/)

## Install

First, clone the repo via git:

```bash
git clone https://github.com/rinocloud/rinobot.git
```

And then install dependencies.

```bash
  npm install
```

## Run

Run these two commands __simultaneously__ in different console tabs.

```bash
$ npm run dev # builds the html based UI and also the rinobot child process, hot reloads
$ npm run start-hot # starts the electron window
```

## Packaging

Let Eoin do the packaging for now

## The rino.yaml file


In the simplest case it only has a list of tasks inside a pipeline

v1:

```yaml
tasks:
  - command: 'rinobot-plugin-rebin'
    match: '*.txt'
    args: '--bin=4'
  - command: 'rinobot-plugin-line-plot'
    match: '*.txt'
    args: '--xmax=4'
```

v2:

```yaml
pipelines:
  # add a file and a list of tasks to run on it, and its children
  - filename: '*.txt'
    tasks:
      - name: rinobot-plugin-normalize
        args: '--xmin=3 --xmax={{key}}'
      - name: rinobot-plugin-rebin
        args: '--bin=3'
      - name: rinobot-plugin-line-plot

metadata:
  key: value
```

## Pipeline algorithm

filepath = 'file which has appeared in watched dir'

for pipeline in pipelines
  for task in pipeline.tasks
    outputFile = runTask(task, filepath)
    filepath = outputFile
    # task will output a file in the temporary folder
    # eg: .rino/tmp/test-normalized.txt
    # when we run again, this time with the last output
    # file as the input, it will create
    # .rino/temp/test-normalized-rebinned-3.txt
    # finally it will plot that, and we copy everything back
    # to next to the original filepath


## Maintainers

- [Eoin Murray](https://github.com/eoinmurray)
- [Helena domo](https://github.com/helenadm)
- [Gediminas Juska](https://github.com/gedj)

## License
[Rinocloud](https://github.com/rinocloud)
