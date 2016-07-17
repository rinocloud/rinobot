
70c634f 16:30 17th July 2016

- Renamed main.development.js to index.dev.js
- Seperate package.json for the electron build and the html app
- No more `npm run dev` now need to console windows to run
  ```bash
  $ cd app && npm run hot-server
  $ npm run start-hot
  ```
