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

## Run

Run this two commands __simultaneously__ in different console tabs.

```bash
$ cd app && npm run hot-server
$ npm run start-hot
```

*Note: requires a node version >= 4 and an npm version >= 2.*

## Maintainers

- [Eoin Murray](https://github.com/eoinmurray)


## License
[Rinocloud](https://github.com/rinocloud)


## Performance tests.

1. Echo'ing 1000 files: It doesn't crash, but it isn't smooth.
2. Going to draw 10,000 logs.
