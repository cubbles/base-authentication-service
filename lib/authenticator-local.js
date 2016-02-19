/* eslint-env node */
var Promise = require('promise')
var restify = require('restify')
var assert = require('assert')

module.exports = Authenticator4AuthSourceLocal
var opts = {
  authDataStoreAdminCredentials: process.env.BASE_AUTH_DATASTORE_ADMINCREDENTIALS.split(':')
}

function Authenticator4AuthSourceLocal () {
}

/**
 * @param client - a restify client used to request the couch-view
 * @param authSource - the authentication-source the login is assigned to (e.g. 'local' for internally managed user-credentials)
 * @param login - the users login for the passed 'authSource'
 * @param retryIfNotFound - optional parameter to signal the detection to be retried in case of no user has been found.
 * @return {Promise}
 */
function detectUser (client, authSource, login, retryIfNotFound) {
  // console.log('detectUser ...')
  assert(client, 'Parameter "client" expected to be passed.')
  assert(authSource === 'local', 'Parameter "authSource" currently supports the value "local" only.')
  assert(login, 'Parameter "login" expected to be passed.')

  client.basicAuth(opts.authDataStoreAdminCredentials[0], opts.authDataStoreAdminCredentials[1])
  return new Promise(
    function (resolve, reject) {
      client.get('/_users/_design/couchapp-authentication-utils@_users/_view/viewUsersByLogin?startkey=["local","' + login + '"]&endkey=["local","' + login + '"]&stale=update_after', function (err, req, res, obj) {
        /*
         * Example result:
         * {"total_rows":3,"offset":0,"rows":[
         *   {"id":"org.couchdb.user:123admin1","key":["local","admin1@cubbles.test", true],"value":null}
         * ]}
         */
        if (err) {
          reject(err)
          return
        }
        if (obj.rows.length < 1) {
          if (retryIfNotFound) {
            // console.log('First try done without result. Going for a second try ...')
            detectUser(client, authSource, login)
              .then(resolve, reject)
            return
          } else {
            // console.log('Second try done.')
            reject({
              id: 'USER_NOT_FOUND',
              desc: 'No user found with a local login "' + login + '".'
            })
            return
          }
        }
        if (obj.rows.length > 1) {
          var rejectObj = {
            id: 'MULTIPLE_USERS_FOUND',
            desc: 'Found ' + obj.rows.length + ' users a local login "' + login + '"! Please contact the Administrator!".'
          }
          reject(rejectObj)
          return
        }
        resolve(obj.rows[ 0 ])
      })
    })
}
/**
 * Check the users credentials.
 * @param login
 * @param password
 * @return {Promise}
 */
Authenticator4AuthSourceLocal.prototype.authenticate = function (login, password) {
  assert(login, 'Parameter "login" expected.')
  assert(password, 'Parameter "password" expected.')

  return new Promise(
    function (resolve, reject) {
      var client = restify.createJsonClient({
        url: process.env.BASE_AUTH_DATASTORE_URL,
        headers: {
          'content-type': 'application/json'
        }
      })
      detectUser(client, 'local', login, true)
        .then(function (res) {
          var userDocId = res.id
          var username = userDocId.split(':')[ 1 ]
          // for authentication we simply request for the users document to verify it's own password
          client.basicAuth(username, password)
          client.get('/_users/' + userDocId, function (err, req, res, obj) {
            if (err) {
              reject(new Error('Authentication for user "' + login + '" failed.'))
            } else {
              resolve(username)
            }
          })
        })
        .catch(function (exc) {
          reject(exc)
        })
    })
}
