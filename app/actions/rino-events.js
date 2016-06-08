import jsonYaml from 'json-yaml'
import pt from 'path'
import fs from 'fs'
import * as api from './api.js'

let addCnt = 0
let unlinkCnt = 0
let addDirCnt = 0
let unlinkDirCnt = 0

export const auth = api.auth;
export const setBase = api.setBase;

export const fileUpload = (metadata, path) => {
    const nixPath =  path.replace(/\\/g,"/")
    const progress = (e) => {
     console.log('Uploaded ' + e.loaded + '/' + e.total )
    }
    const complete = (err, response) => {
      let md = JSON.stringify(response.body)
      md = JSON.parse(md)
      delete md['metadata']
      md = JSON.stringify(md)
      //md = jsonYaml(md)
      fs.writeFile(`${path}.rino`, md, (err) => {
          if(err) {
            return console.log(err);
          }
        })
    }
    let m = JSON.parse(metadata)
    m["name"] = `${nixPath}`
    m = JSON.stringify(m)
    console.log(m)
    return api.upload(path, m, progress, complete)
}

/*
*  parseTOML
*/
export const parseTOML = (path) => {
  const nixPath =  path.replace(/\\/g,"/")
  const tomlPath = `${nixPath}.toml`

  fs.readFile(tomlPath, 'utf-8', (err, data) => {
    if (err) return console.log(err)
    try {
      let metadata = JSON.parse(data)
      metadata = JSON.stringify(metadata)
      return fileUpload(metadata, path)
    } catch (e) {

    }
  })
  return
}

/*
*  parseRinoId
*/
export const parseRinoId = (path) => {
  const data = fs.readFileSync(path, 'utf-8')
  //ERROR HANDLING HERE
  let metadata = JSON.parse(data)
  return metadata.id

}

/*
*  updateMetadata
*/
export const updateMetadata = (id, path) => {
  fs.readFile(path, 'utf-8', (err, data) => {
    if (err) return console.log(err)
    try {
      let metadata = JSON.parse(data)

      api
        .updateOverwrite(id, metadata)
        .then((payload, err) => {
          console.log(payload, err)
        })
        .catch((err) => {
          console.log(err)
        })
    } catch (e) {

    }
  })
return
}

/*
*  deleteOld
*/
export const deleteOld = (id) => {
  api
    .deleteObject(id)
    .then((payload, err) => {
       console.log(payload, err)
      })
      .catch((err) => {
        console.log(err)
      })
}

/*
*  handleEvent
*/

export const doAdd = (event, path, stats, callback) => {
  callback(`handleAdd::${path}`)
  if(pt.extname(path) == '.toml') {
    //check if the data file (the same name, different extension) is already on Rino:
    // (either if a local console json file exists or it's in the tree):
    //if exists -> update metadata
    //if not -> ignore as it will be parsed and uploaded with the main data file
    const pathWithoutExt = path.substr(0, path.lastIndexOf('.'))
    const rinoPath = `${pathWithoutExt}.rino`
    fs.exists(rinoPath, (exists) => {
      if (!exists) return
      //Read rino(json) file (or tree) for file id and update file metadata
      //Could be extra update in case of moving or renaming parent folders
      callback('Read json and update metadata')
      const id = parseRinoId(rinoPath)
      updateMetadata(id, path)
    })
  }

  else if(pt.extname(path) == '.rino') {}

  else{
    setTimeout(() => {
      fs.exists(`${path}.toml`, (exists) => {
        if (!exists) {
          callback('upload without metadata')
          const metadata = '{}'
          fileUpload(metadata, path)
        } else  {
          callback('Parse metadata from TOML file and upload.')
          parseTOML(path)
        }
      })
    }, 1000)
  }
}

export const handleAdd = (event, path, stats, callback) => {
  addCnt += 1
  //detect possible file path renaming events
  if (unlinkCnt > 0 || stats.size===0)  {
    callback('unlink and add events within 1s - possible renaming (not supported)')
  } else {
    doAdd(event, path, state, callback)
  }
}

export const handleChange = (event, path, stats, callback) => {
  callback(`handleChange::${path}`)
  if(pt.extname(path) == ".toml") {
    const pathWithoutExt = path.substr(0, path.lastIndexOf('.'))
    const rinoPath = `${pathWithoutExt}.rino`
    fs.exists(rinoPath, (exists) => {
      if (!exists) return
      //Read rino(json) file (or tree) for file id and update file metadata
      callback('Read json and update metadata')
      const id = parseRinoId(rinoPath)
      updateMetadata(id, path)
    })
  }
  else{
    //handle normal file updates: delete the old one, upload the new one
    //const rinoPath = `${path}.rino`
    fs.exists(`${path}.rino`, (exists) => {
      if (!exists) return
      //Read rino(json) file (or tree) for file id and update file metadata
      callback('Replace file (id is different)')
      const id = parseRinoId(`${path}.rino`)
      //delete file, and rino file
      deleteOld(id)
      //id could be saved for tracking previous versions
      //upload the new one
      fs.exists(`${path}.toml`, (exists) => {
        if (!exists) {
          callback('upload without metadata')
          const metadata = '{}'
          fileUpload(metadata, path)
        } else  {
          callback('Parse metadata from TOML file and upload.')
          parseTOML(path)
        }
      })
    })
  }
}

export const handleEvent = (event, path, stats, callback) => {
  callback(`event:: ${event}. path::${path}`)

  if (event === 'add') {
    handleAdd(event, path, stats, callback)
  }
  if (event === 'change') {
    handleChange(event, path, stats, callback)
  }
  if (event === 'unlink') {
    unlinkCnt += 1
  }
}
