/* eslint-env node */
var Promise = require('promise')
module.exports = PermissionResolver
var restify = require('restify')
var client = restify.createJsonClient({
  url: 'http://coredatastore:5984'
})

function PermissionResolver () {
}

PermissionResolver.prototype.doResolve = function (username, stores) {
  return new Promise(
    function (resolve, reject) {
      console.log('PermissionResolver.doResolve ...')
      var _permissions = {}
      var _stores = stores || []
      _stores.forEach(function (store, index, array) {
        // request for stores permissions document
        client.get('/_users/org.couchdb.user:' + username, function (err, req, res, obj) {
          if (err) {
            reject(new Error('Authentication for user "' + username + '" failed.'))
          } else {
            resolve(username)
          }
        })
        _permissions[ store ] = {
          upload: true
        }
      })
      resolve(_permissions)
    })
}
