import fs from 'fs'
import pt from 'path'
import 'superagent-queue'
import Evaporate from 'evaporate'
import uploader from './uploader'
import superagent from 'superagent'
import promisePlugin from 'superagent-promise-plugin'

let request = promisePlugin.patch(superagent)

export let log = (s) => {
  console.log(s)
}

try {
  var csrf = document.getElementsByName("csrfmiddlewaretoken")[0].value;
  var end = request.Request.prototype.end;
  request.Request.prototype._end = function(fn) {
    return end.call(this, fn);
  };
  request.Request.prototype.end = function(fn) {
    this.set('X-CSRFToken', csrf);
    return end.call(this, fn);
  }
}
catch (err) {}


const processResponse = (response) => {
  if (response.status >= 400) {
    throw new Error("Bad response from server");
  }
  return response.body;
}

/*
Authentication and host settings
*/

export let config = {
  base: '',
  token: null
}

export const setBase = (base) => {
  config.base = base
}

export const auth = (token) => {

  config.token = token

  var end = request.Request.prototype.end;

  request.Request.prototype.end = function(fn) {
    // this.set('Authorization', 'Token ' + config.token);
    return end.call(this, fn);
  };
}

// FILE API

/*
Creation routes
*/
export function createObject(metadata){
  return request
  .post(config.base + '/api/1/files/create_object/')
  .set('Authorization', 'Token ' + config.token)
  .send(metadata)
  .then(processResponse)
}

export function createFolder(metadata){
  return request
  .post(config.base + '/api/1/files/create_folder/')
  .set('Authorization', 'Token ' + config.token)
  .send(metadata)
  .then(processResponse)
}

export function createNotebook(metadata){
  return request
  .post(config.base + '/api/1/files/create_notebook/')
  .set('Authorization', 'Token ' + config.token)
  .send(metadata)
  .then(processResponse)
}

export function createEmpty(metadata){
  return request
  .post(config.base + '/api/1/files/create_empty/')
  .set('Authorization', 'Token ' + config.token)
  .send(metadata)
  .then(processResponse)
}

/*
Retrieval routes
*/

export function getMetadata(id){
  return request
  .post(config.base + '/api/1/files/get_metadata/')
  .set('Authorization', 'Token ' + config.token)
  .send({id: id})
  .then(processResponse)
}

export function getChildren(id, limit=20, offset=0){
  return request
  .post(config.base + '/api/1/files/children/')
  .set('Authorization', 'Token ' + config.token)
  .send({id: id, limit: limit, offset: offset})
  .then(processResponse)
}

export function getAncestors(id){
  return request
  .post(config.base + '/api/1/files/ancestors/')
  .set('Authorization', 'Token ' + config.token)
  .send({id: id})
  .then(processResponse)
}

/*
Update routes
*/

export function updateMerge(id, metadata){
  metadata["id"] = id

  return request
  .post(config.base + '/api/1/files/update_metadata/')
  .set('Authorization', 'Token ' + config.token)
  .send(metadata)
  .then(processResponse)
}

export function updateOverwrite(id, metadata){
  return request
  .post(config.base + '/api/1/files/update_metadata/')
  .set('Authorization', 'Token ' + config.token)
  .send({id: id, metadata: metadata})
  .then(processResponse)
}

export function deleteMetadataField(id, field){
  return request
  .post(config.base + '/api/1/files/delete_metadata_field/')
  .set('Authorization', 'Token ' + config.token)
  .send({id: id, field: field})
  .then(processResponse)
}

export function deleteObject(id){
  return request
  .post(config.base + '/api/1/files/delete/')
  .set('Authorization', 'Token ' + config.token)
  .send({id: id})
  .then(processResponse)
}

export function moveObject(targetParent, items){
  // targetParent is the id of the new parent
  // items is a list of ids to moveObject
  return request
  .post(config.base + '/api/1/files/delete/')
  .set('Authorization', 'Token ' + config.token)
  .send({
    parent: targetId,
    items: moveIds
  })
  .then(processResponse)
}

/*
Breadcrumbs
*/

export function fetchBreadcrumbs(id){
  return request
  .post(config.base + '/api/1/files/ancestors/')
  .set('Authorization', 'Token ' + config.token)
  .send({id: id})
  .then(processResponse)
}

/*
Invites
*/

export function fetchInvites(){
  return request
  .get(config.base + '/api/1/users/get_invites/')
  .set('Authorization', 'Token ' + config.token)
  .then(processResponse)
}

export function sendInvite(email){
  return request
  .post(config.base + '/api/1/users/send_invite/')
  .set('Authorization', 'Token ' + config.token)
  .send({email: email})
  .then(processResponse)
}

export function reSendInvite(id){
  return request
  .post( '/api/1/users/re_send_invite/')
  .send({id: id})
  .then(processResponse)
}

export function deleteInvite(id){
  return request
  .post(config.base + '/api/1/users/delete_invite/')
  .set('Authorization', 'Token ' + config.token)
  .send({id: id})
  .then(processResponse)
}

/*
Comments
*/

export function fetchComments(objectId){
  return request
  .post(config.base + '/api/1/comments/list_comments/')
  .set('Authorization', 'Token ' + config.token)
  .send({"object_id": objectId})
  .then(processResponse)
}

export function createComment(objectId, value){
  return request
  .post(config.base + '/api/1/comments/create_comment/')
  .set('Authorization', 'Token ' + config.token)
  .send({object_pk: objectId, comment: value})
  .then(processResponse)
}

export function updateComment(commentId, value){
  return request
  .post(config.base + '/api/1/comments/update_comment/')
  .set('Authorization', 'Token ' + config.token)
  .send({id: commentId, comment: value})
  .then(processResponse)
}

export function deleteComment(commentId){
  return request
  .post(config.base + '/api/1/comments/delete_comment/')
  .set('Authorization', 'Token ' + config.token)
  .send({id: commentId})
  .then(processResponse)
}


/*
Query
*/

export function query(query, limit=20, offset=0){
  return request
  .post(config.base + '/api/1/files/query/')
  .set('Authorization', 'Token ' + config.token)
  .send({
    query: query,
    limit: limit,
    offset: offset
  })
  .then(processResponse)
}

export function autocompleteQuery(){
  return request
  .post(config.base + '/api/1/files/autocomplete_search/')
  .set('Authorization', 'Token ' + config.token)
  .then(processResponse)
}

export function autocompleteValues(field){
  return request
  .post(config.base + '/api/1/files/autocomplete_values/')
  .set('Authorization', 'Token ' + config.token)
  .send({field: field})
  .then(processResponse)
}


/*
Uploading routes

Currently we only support basic multiPartUpload for node.js

- `multiPartUpload(path, data={}, progress, error, complete)`
path: file path
data: object which contains metadata (must at least have name)
progress: gets called with object containign loaded and total
complete: called with err, res when upload is finished

example:
```
const progress = (e) => {
  console.log('Uploaded ' + e.loaded + '/' + e.total )
}

const complete = (err, response) => {
  console.log(response.body)
}

api.multiPartUpload('./test.txt', {name:"example/test.txt"}, progress, error, complete)
```

- `s3uploadBrowser(file, data={}, progress, error, complete)`
file: html5 file object
data: object which contains metadata (must at least have name)
progress: gets called with object containign loaded and total
complete: called with err, res when upload is finished

- `s3uploadElectron(path, data={}, progress, error, complete)`
path: path to file
data: object which contains metadata (must at least have name)
progress: gets called with object containign loaded and total
complete: called with err, res when upload is finished

*/

var File = function(path){
  /*
  Super basic polyfill of hmtl5 file object, used by the electron uploader
  */
  this.name = pt.basename(path)
  const stats = fs.statSync(path)
  this.size = stats["size"]

  this.buff = fs.readFileSync(path)
  this.slice = function(from_byte, to_byte){
    return this.buff.slice(from_byte, to_byte)
  }.bind(this)

  return this
}

export function s3postBrowser(file, name, progress, error, complete){
  const evap = new Evaporate({
    signerUrl: config.base + '/api/1/files/sign_s3/',
    aws_key: 'AKIAIMNS62CAOTEN53BA',
    bucket: 'rinocloud',
    cloudfront: true,
    aws_url: 'https://rinocloud.s3.amazonaws.com'
  })

  evap.add({
    name: name,
    file: file,
    notSignedHeadersAtInitiate: {
      'Cache-Control': 'max-age=3600'
    },
    xAmzHeadersAtInitiate : {
      'x-amz-acl': 'private'
    },
    signHeaders: {
      'Authorization': 'Token ' + config.token
    },
    beforeSigner: function(xhr) {
      var requestDate = (new Date()).toISOString();
      xhr.setRequestHeader('Request-Header', requestDate);
    },
    complete: complete,
    progress: progress
  });
}

export function s3postElectron(file, name, progress, error, complete) {

  var up = new uploader({
    auth_url: config.base + '/api/1/files/sign_s3/',
    auth_url_headers:{
      'Authorization': 'Token ' + config.token
    },
    file_name: name,
    file: file,
    bucket: 'rinocloud',
    aws_url: 'https://rinocloud.s3.amazonaws.com',
    aws_key_id: 'AKIAIMNS62CAOTEN53BA',
    on_complete: complete,
    on_progress: progress,
    on_error: error
  })

  up.init_multipart_upload()
}

export function s3uploadBrowser(file, data={}, progress, error, complete){
  /*
  Does a direct s3 upload from the browser
  */
  const uploadFinished = (name, id) => {
    request
      .post(config.base + '/api/1/files/post_s3_upload/')
      .set('Authorization', 'Token ' + config.token)
      .send({name: name, id: id})
      .then(complete)
      .catch(error)
  }

  let name = file.name
  if (file.hasOwnProperty('fullPath')) name = file.fullPath
  data["size"] = file.size
  request
  .post(config.base + '/api/1/files/pre_s3_upload/')
  .set('Authorization', 'Token ' + config.token)
  .send(data)
  .queue('pre_s3_upload')
  .then((response)=>{
    s3postBrowser(file, response.body.upload_name, progress, error, uploadFinished.bind(null, response.body.upload_name, response.body.data.id))
  })
  .catch(error)
}

export function s3uploadElectron(path, data={}, progress, error, complete){
  /*
  Does a direct s3 upload from electron.js takes a pure path as argument
  not a html5 file object

  It creates its own html5 file polyfill
  */

  var file = new File(path)
  const uploadFinished = (name, id) => {
    request
      .post(config.base + '/api/1/files/post_s3_upload/')
      .set('Authorization', 'Token ' + config.token)
      .send({name: name, id: id})
      .then(complete)
      .catch(error)
  }

  let name = file.name
  if (file.hasOwnProperty('fullPath')) name = file.fullPath

  data["size"] = file.size
  request
    .post(config.base + '/api/1/files/pre_s3_upload/')
    .set('Authorization', 'Token ' + config.token)
    .send(data)
    .queue('pre_s3_upload')
    .then((response)=>{
      s3postElectron(file, response.body.upload_name, progress, error, uploadFinished.bind(null, response.body.upload_name, response.body.data.id))
    })
    .catch(error)
  }

export function multiPartUpload(path, data={}, progress, error, complete){
  /*
  Does a multipart upload direct to rinocloud.
  Doesnt handle large files. Only <50mb
  */
  return request
    .post(config.base + '/api/1/files/upload_multipart/')
    .set('Authorization', 'Token ' + config.token)
    .queue('upload')
    .attach('file', path)
    .field('json', JSON.stringify(data))
    .on('progress', progress)
    .then(complete)
    .catch(error)
}
