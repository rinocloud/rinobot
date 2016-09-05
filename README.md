
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

## Maintainers

- [Eoin Murray](https://github.com/eoinmurray)
- [Helena domo](https://github.com/helenadm)
- [Gediminas Juska](https://github.com/gedj)

## License
[Rinocloud](https://github.com/rinocloud)

## Storage idea

{
  filepath: {
    id - rinocloud id or null,
    etag - file etag - calculated locally,
    created - ISO date string
    completed: [
      task name - task argument - ISO date string,
    ]
  }
}
