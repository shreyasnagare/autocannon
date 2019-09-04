'use strict'

const inherits = require('util').inherits
const requestBuilder = require('./httpRequestBuilder')
const consecutive = require('consecutive')
var next

function RequestIterator (requests, defaults) {
  if (!(this instanceof RequestIterator)) {
    return new RequestIterator(requests, defaults)
  }

  this.reqDefaults = defaults
  this.requestBuilder = requestBuilder(defaults)
  this.setRequests(requests)
}

inherits(RequestIterator, Object)

RequestIterator.prototype.nextRequest = function () {
  ++this.currentRequestIndex
  this.currentRequestIndex = this.currentRequestIndex < this.requests.length ? this.currentRequestIndex : 0
  this.currentRequest = this.requests[this.currentRequestIndex]
  return this.currentRequest
}

RequestIterator.prototype.nextRequestBuffer = function () {
  // get next request
  this.nextRequest()
  return this.currentRequest.requestBuffer
}

RequestIterator.prototype.move = function () {
  // get the current buffer and proceed to next request
  let ret = this.currentRequest.requestBuffer
  this.nextRequest()
  if(this.reqDefaults.idReplacement){
    let today = new Date()
    // let number = parseInt((next()+1)/2+0.5)
    // let pathRet = Buffer.from(ret.toString().replace(/~id~/g, number.toString().padStart(10,"0")))
    let pathRet = Buffer.from(ret.toString().replace(/~id~/g, next().toString().padStart(10,"0")))
    let timeRet = Buffer.from(pathRet.toString().replace(/~tm~/g, (today.getTime()/1000).toFixed(3)))
    // let dataRet = Buffer.from(timeRet.toString().replace(/\[<id>\]/g, number.toString().padStart(14,"0")))
    let dataRet = Buffer.from(timeRet.toString().replace(/\[<id>\]/g, next()))
    return dataRet
  }
  return ret
}

RequestIterator.prototype.setRequests = function (newRequests) {
  this.requests = newRequests || [{}]
  this.currentRequestIndex = 0
  next = consecutive()
  this.currentRequest = this.requests[0]
  this.rebuildRequests()
}

RequestIterator.prototype.rebuildRequests = function () {
  this.requests.forEach((request) => {
    request.requestBuffer = this.requestBuilder(request)
  })
}

RequestIterator.prototype.setHeaders = function (newHeaders) {
  this.currentRequest.headers = newHeaders || {}
  this.rebuildRequest()
}

RequestIterator.prototype.setBody = function (newBody) {
  this.currentRequest.body = newBody || Buffer.alloc(0)
  this.rebuildRequest()
}

RequestIterator.prototype.setHeadersAndBody = function (newHeaders, newBody) {
  this.currentRequest.headers = newHeaders || {}
  this.currentRequest.body = newBody || Buffer.alloc(0)
  this.rebuildRequest()
}

RequestIterator.prototype.setRequest = function (newRequest) {
  this.currentRequest = newRequest || {}
  this.rebuildRequest()
}

RequestIterator.prototype.rebuildRequest = function () {
  this.currentRequest.requestBuffer = this.requestBuilder(this.currentRequest)
  this.requests[this.currentRequestIndex] = this.currentRequest
}

module.exports = RequestIterator
