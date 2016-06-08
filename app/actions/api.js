import 'superagent-queue'
import Evaporate from 'evaporate'
import superagent from 'superagent'
import promisePlugin from 'superagent-promise-plugin'

let request = promisePlugin.patch(superagent)

let isNode = false
if (typeof module !== 'undefined' && module.exports) {
  isNode = true
}

if (!isNode){
  /*
    Try and get the CSRF token if we are running from Django.
  */
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
}

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
    this.set('Authorization', 'Token ' + token);
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
    .send(metadata)
    .then(processResponse)
}

export function createFolder(metadata){
  return request
    .post(config.base + '/api/1/files/create_folder/')
    .send(metadata)
    .then(processResponse)
}

export function createNotebook(metadata){
  return request
    .post(config.base + '/api/1/files/create_notebook/')
    .send(metadata)
    .then(processResponse)
}

export function createEmpty(metadata){
  return request
    .post(config.base + '/api/1/files/create_empty/')
    .send(metadata)
    .then(processResponse)
}

/*
  Retrieval routes
*/

export function getMetadata(id){
  return request
    .post(config.base + '/api/1/files/get_metadata/')
    .send({id: id})
    .then(processResponse)
}

export function getChildren(id, limit=20, offset=0){
  return request
    .post(config.base + '/api/1/files/children/')
    .send({id: id, limit: limit, offset: offset})
    .then(processResponse)
}

export function getAncestors(id){
  return request
    .post(config.base + '/api/1/files/ancestors/')
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
    .send(metadata)
    .then(processResponse)
}

export function updateOverwrite(id, metadata){
  return request
    .post(config.base + '/api/1/files/update_metadata_overwrite/')
    .send({id: id, metadata: metadata})
    .then(processResponse)
}

export function deleteMetadataField(id, field){
  return request
    .post(config.base + '/api/1/files/delete_metadata_field/')
    .send({id: id, field: field})
    .then(processResponse)
}

export function deleteObject(id){
  return request
    .post(config.base + '/api/1/files/delete/')
    .send({id: id})
    .then(processResponse)
}

export function moveObject(targetParent, items){
  // targetParent is the id of the new parent
  // items is a list of ids to moveObject
  return request
    .post(config.base + '/api/1/files/delete/')
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
  .send({id: id})
  .then(processResponse)
}

/*
  Invites
*/

export function fetchInvites(){
  return request
  .get(config.base + '/api/1/users/get_invites/')
  .then(processResponse)
}

export function sendInvite(email){
  return request
    .post(config.base + '/api/1/users/send_invite/')
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
    .send({id: id})
    .then(processResponse)
}

/*
  Comments
*/

export function fetchComments(objectId){
  return request
  .post(config.base + '/api/1/comments/list_comments/')
  .send({"object_id": objectId})
  .then(processResponse)
}

export function createComment(objectId, value){
  return request
    .post(config.base + '/api/1/comments/create_comment/')
    .send({object_pk: objectId, comment: value})
    .then(processResponse)
}

export function updateComment(commentId, value){
  return request
    .post(config.base + '/api/1/comments/update_comment/')
    .send({id: commentId, comment: value})
    .then(processResponse)
}

export function deleteComment(commentId){
  return request
    .post(config.base + '/api/1/comments/delete_comment/')
    .send({id: commentId})
    .then(processResponse)
}


/*
 Query
*/

export function query(query, limit=20, offset=0){
  return request
    .post(config.base + '/api/1/files/query/')
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
    .then(processResponse)
}

export function autocompleteValues(field){
  return request
    .post(config.base + '/api/1/files/autocomplete_values/')
    .send({field: field})
    .then(processResponse)
}


/*
  Uploading routes
*/

export function s3post(file, name, progress, complete){
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
     complete: () => {
      complete(name)
     },
     progress: progress
  });
}

export function browserUpload(file, data={}, progress, complete){

  const uploadFinished = (id, name) => {
    request
      .post(config.base + '/api/1/files/post_s3_upload/')
      .send({name: name, id: id})
      .end((err, res) => {
        complete(err, res)
      })
  }

  let name = file.name
  if (file.hasOwnProperty('fullPath')) name = file.fullPath
  data["size"] = file.size
  data["name"] = name
  request
    .post(config.base + '/api/1/files/pre_s3_upload/')
    .send(data)
    .queue('pre_s3_upload')
    .end((err, res) => {
      if(!err) {
        const id = res.body.data.id
          s3post(file, res.body.upload_name, progress, (name) => {
            uploadFinished(id, name)
          })
      }
    })
}

export function nodeDirectUpload(file, data={}, progress, complete){
    return request
      .post(config.base + '/api/1/files/upload_multipart/')
      .queue('upload')
      .attach('file', file)
      //.field('json', JSON.stringify(data))
      .field('json', data)
      .on('progress', progress)
      .end(complete)
}

export function upload(file, data={}, progress, complete){

    if(!isNode){
      return browserUpload(file, data, progress, complete)
    }
    else{
      return nodeDirectUpload(file, data, progress, complete)
    }

 }
