
70c634f 16:30 17th July 2016

- Renamed main.development.js to index.dev.js
- Seperate package.json for the electron build and the html app
- No more `npm run dev` now need to console windows to run
  ```bash
  $ cd app && npm run hot-server
  $ npm run start-hot
  ```


82e832 14:35 27th July 2016

- Moved most electron related code to main/, all install/build scripts still work
