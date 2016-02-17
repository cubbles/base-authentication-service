/* eslint-env node */
var Promise = require('promise')
module.exports = GroupResolver
var restify = require('restify')
var client = restify.createJsonClient({
  url: process.env.BASE_AUTH_DATASTORE_URL
})

function GroupResolver () {
}

function resolveGroups (username) {
  return new Promise(
    function (resolve, reject) {
      var _groups = []
      client.get('/groups/_design/couchapp-authentication-utils@groups/_view/viewGroupsByUser?startkey=["' + username + '"]&endkey=["' + username + '"]', function (err, req, res, obj) {
        if (err) {
          reject(err)
          return
        }
        obj.rows.forEach(function (row, index, array) {
          _groups.push(row.id)
        })
        resolve(_groups)
      })
    }
  )
}

GroupResolver.prototype.doResolve = function (username) {
  return new Promise(
    function (resolve, reject) {
      resolveGroups(username)
        .then(function (groups) {
          resolve(groups)
        })
    }
  )
}
