import 'superagent-queue'
import superagent from 'superagent'
import promisePlugin from 'superagent-promise-plugin'
import bind from 'lodash/bind'
import extend from 'lodash/extend'

let request = promisePlugin.patch(superagent)

function joinUrlElements() {
  var re1 = new RegExp('^\\/|\\/$','g'),
  elts = Array.prototype.slice.call(arguments);
  return elts.map(function(element){return element.replace(re1, ""); }).join('/');
}

export default function(config){
  /*
  - aws_url: 'https://mybucket.s3.amazonaws.com/'

  - file_name: 'ex.txt'
  Name will be saved for file in s3

  - file: $('#input_file')[0].files[0] or something like this :)

  - auth_url: 'http://my.com/auth_sign'
  URL on your server where is possible get signature for request

  e.x.backend function on python(django):
  def auth_sign(request):
    to_sign = request.GET.get('to_sign')  # 'POST\n\n\n\nx-amz-date:Tue, 01 Sep 2015 13:47:40 GMT\n/mybucket/name_file.txt?uploads'
    signature = base64.b64encode(hmac.new(AWS_S3_SECRET_ACCESS_KEY, to_sign, hashlib.sha1).digest())
    return HttpResponse(signature)

  - bucket: 'mybucket'

  - aws_key_id: 'AKIAJ572SSBCX7IKLMVQ'

  - auth_url_headers: {'any': 'for your backend'}
  This headers will be added in GET request on "auth_url"
  It's required if your backend requires any mandatory header

  Optional:

  - partSize: integer
  Size for one part(blob) in byte

  - on_complete: function()
  Fires when multipart upload is complete

  - on_progress: function(total, loaded)
  Fires when part is uploaded

  - on_error: function()
  */

  var self = this,
  required_keys = [
    'aws_url',
    'file_name',
    'file',
    'auth_url',
    'bucket',
    'aws_key_id',
    'auth_url_headers'
  ],
  missed_keys = [],
  all_keys = [],
  key,
  ind;

    self.config = extend(
    {partSize: 6 * 1024 * 1024},  // 6 Mb
    config || {}
  );

  // "Check mandatory keys in config"
  for (key in self.config){
    if (self.config.hasOwnProperty(key)) {
      all_keys.push(key);
    }
  }
  for (ind in required_keys){
    if(all_keys.indexOf(required_keys[ind]) == -1){
      missed_keys.push(required_keys[ind]);
    }
  }
  if(missed_keys.length > 0){
    self.config.not_supported_error && self.config.not_supported_error();
    throw 'Missed keys in config: ' + missed_keys.join(', ');
  }

  self.config.file_name = encodeURIComponent(self.config.file_name);
  self.config.file.name = encodeURIComponent(self.config.file.name);
  self.count_of_parts = Math.ceil(self.config.file.size / self.config.partSize) || 1;
  self.total = self.config.file.size;
  self.loaded = 0;
  self.current_part = 1;
  self.parts = [];

  self.init_multipart_upload = function(){
    self._sign_request('POST', '?uploads', '', function(signature, date_gmt){
      self._get_upload_id(signature, date_gmt); // as result we have self.UploadId
    });
  }

  self._sign_request = function(method, suffix_to_sign, contentType, success_callback){
    const date_gmt = new Date().toUTCString();
    let to_sign = method + '\n\n' + contentType + '\n\nx-amz-date:' + date_gmt + '\n/' + self.config.bucket + '/' + self.config.file_name + suffix_to_sign;
    const url = joinUrlElements(self.config.auth_url, '/?to_sign=' + encodeURIComponent(to_sign))

    var r = request
      .get(url)
      .set(self.config.auth_url_headers)
      .then((response)=>{
        if (response.status >= 400) {
          throw new Error("Bad response from server");
        }
        return response.text;
      })
      .then((signature)=>{
          success_callback(signature, date_gmt)
      })
      .catch(self.config.on_error)
  }

  self._send_part = function(){
    var from_byte,
    to_byte,
    suffix_to_sign,
    blob;

    if(self.parts.length == self.count_of_parts){
      suffix_to_sign = '?uploadId=' + self.UploadId
      self._sign_request('POST', suffix_to_sign, 'application/xml; charset=UTF-8', function(signature, date_gmt){
        self.complete_multipart_upload(signature, date_gmt, suffix_to_sign)
      })
      return
    }

    from_byte = (self.current_part - 1) * self.config.partSize  // self.current_part starts from 1
    to_byte = self.current_part * self.config.partSize
    blob = self.config.file.slice(from_byte, to_byte)
    suffix_to_sign = '?partNumber=' + self.current_part + '&uploadId=' + self.UploadId
    self._sign_request('PUT', suffix_to_sign, 'application/octet-stream', function(signature, date_gmt){
      self._send_blob(signature, date_gmt, suffix_to_sign, blob)
    })
  }

  self._send_blob = function(signature, date_gmt, suffix, blob){
    const url = joinUrlElements(self.config.aws_url, '/' + self.config.file_name + suffix)

    request
      .put(url)
      .set('Authorization', 'AWS ' + self.config.aws_key_id + ':' + signature)
      .set('x-amz-date', date_gmt)
      .type('application/octet-stream')
      .set('content-length', blob.length)
      .send(blob)
      .on('progress', (e)=>{
        self.config.on_progress(self.total, self.loaded + e.percent)
      })
      .then((response)=>{
        const ETag = response.header['etag']
        self.parts.push(ETag)
        self.loaded += blob.length
        self.config.on_progress(self.total, self.loaded)
        self.current_part += 1
        setTimeout(function(){
          self._send_part()
        }, 50)
      })
      .catch(self.config.on_error)
  }

  self._get_upload_id = function(signature, date_gmt){
    const url = joinUrlElements(self.config.aws_url, '/' + self.config.file_name + '?uploads')
    request
      .post(url)
      .buffer()
      .set('Authorization', 'AWS ' + self.config.aws_key_id + ':' + signature)
      .set('x-amz-date', date_gmt)
      .then((res)=>{
        const uploadId = res.text.match(/<UploadId\>(.+)<\/UploadId\>/)
        if (uploadId && uploadId[1]){
          self.UploadId = uploadId[1]
          setTimeout(function(){
            self._send_part()
          }, 50)
        }
        else{
          throw new Error('Got a response from S3 - but it did not provide and uploadId')
        }
      })
      .catch(self.config.on_error)
  }

  self.complete_multipart_upload = function(signature, date_gmt, suffix){
    const url = joinUrlElements(self.config.aws_url, '/' + self.config.file_name + suffix)
    let completeDoc = '<CompleteMultipartUpload>'
    self.parts.forEach(function(ETag, partNumber){
      completeDoc += '<Part><PartNumber>' + (partNumber + 1) + '</PartNumber><ETag>' + ETag + '</ETag></Part>'
    })
    completeDoc += '</CompleteMultipartUpload>'

    request
      .post(url)
      .set('Authorization', 'AWS ' + self.config.aws_key_id + ':' + signature)
      .set('Content-Type', 'application/xml; charset=UTF-8')
      .set('x-amz-date', date_gmt)
      .send(completeDoc)
      .then(self.config.on_complete)
      .catch(self.config.on_error)
  }
}
