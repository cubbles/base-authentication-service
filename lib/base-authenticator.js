/* eslint-env node */
var Promise = require('promise')
var restify = require('restify')
var client = restify.createJsonClient({
  url: 'http://coredatastore:5984'
})

module.exports = BaseAuthenticator

function BaseAuthenticator () {
}

/**
 * Check the users credentials.
 * @param username
 * @param password
 * @return Promise
 */
BaseAuthenticator.prototype.authenticate = function (username, password) {
  return new Promise(
    function (resolve, reject) {
      client.basicAuth(username, password)
      // we simply request for the users document to check the it's own credentials
      client.get('/_users/org.couchdb.user:' + username, function (err, req, res, obj) {
        if (err) {
          reject(new Error('Authentication for user "' + username + '" failed.'))
        } else {
          resolve(username)
        }
      })
    })
}
