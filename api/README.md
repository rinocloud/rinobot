# Rinocloud api.js

```javascript


import * as api from './api.js'

api.auth('651ae65b9d5106e53106fbb7f525218b7b2e1456')
api.setBase('http://localhost:8000')

/*
  Create object example
*/

api
  .createObject({name: 'test_object'})
  .then(
    payload => {
      console.log(payload)
    },
    error => {
      console.log(error.response.body.error)
    }
  )

// with is equivalent to
api
  .createObject({name: 'test_object'})
  .then((payload, error) => {
    console.log(payload)
    if (error) console.log(error.response.body.error)
  })


/*
  Upload example
*/

const progress = (e) => {
  console.log('Uploaded ' + e.loaded + '/' + e.total )
}

const complete = (err, response) => {
  console.log(response.body)
}

api.upload('./test.txt', {name:"test.txt"}, progress, complete)
```
