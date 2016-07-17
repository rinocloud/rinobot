# Rinobot

This is the interface for the command line program [rinobot.js](https://github.com/rinocloud/rinobot/)

## Install

First, clone the repo via git:

```bash
git clone https://github.com/rinocloud/rinobot.git
```

And then install dependencies.

```bash
$ ./scripts/install.sh
```

Then install the npm modules for both submodules

```bash
>>> cd app/rinobot.js
>>> npm install
>>> cd ..
```

```bash
>>> cd app/rinocloud-javascript
>>> npm install
>>> cd ..
```

## Run

Run this two commands __simultaneously__ in different console tabs.

```bash
$ cd app && npm run hot-server
$ npm run start-hot
```

## Packaging

1. First build the app. Either run `sh ./scripts/build.sh` or just run all the
commands inside `./scripts/build.sh`

2. Either run `sh ./scripts/package-this.sh` or just run all the commands inside `./scripts/package-this.sh`
This will build the app for the current operating system.

### Packaging for all operating systems at once

This is only tested on mac, and you need wine installed. but

```
sh ./scripts/package-all.sh
```

should work.

## Maintainers

- [Eoin Murray](https://github.com/eoinmurray)
- [Helena domo](https://github.com/helenadm)
- [Gediminas Juska](https://github.com/gedj)

## License
[Rinocloud](https://github.com/rinocloud)

## Performance tests.

1. Echo'ing 1000 files: It doesn't crash, but it isn't smooth.
2. Going to draw 10,000 logs.
