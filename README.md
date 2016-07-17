# Rinobot

This is the interface for the command line program [rinobot.js](https://github.com/rinocloud/rinobot/)

## Install

First, clone the repo via git:

```bash
git clone https://github.com/rinocloud/rinobot.git
```

And then install dependencies.

```bash
>>> sh ./scripts/install.sh
```

Or just go into `./scripts/install.sh` and run each command

## Install errors

If you get something like the following

```
> cross-env HOT=1 NODE_ENV=development electron -r babel-register -r babel-polyf                                                                     ill ./main.development

fs.js:634
  return binding.open(pathModule._makeLong(path), stringToFlags(flags), mode);
                 ^
Error: ENOENT: no such file or directory, open 'C:\Users\eoin\Documents\projects\rinobot\node_modules\electron-prebuilt\path.txt'
```

Try running

```
>>> cd node_modules/electron-prebuilt
>>> npm install
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
