/* eslint-env node */
var Promise = require('promise')
module.exports = PermissionResolver
var restify = require('restify')
var client = restify.createJsonClient({
  url: process.env.BASE_AUTH_DATASTORE_URL
})

function PermissionResolver () {
}

/**
 * Calcualte the permissions to be inserted into the access_token
 *
 * @param couchResult {Object}
 * example structure:
 * [
 *   {"id":"base-api-test-store1","key":["store1","base-api-test-group-globalAdmins"],"value":{"read":true}},
 *   {"id":"base-api-test-store2","key":["store2","base-api-test-group-globalAdmins"],"value":{"read":true}}
 *   {"id":"base-api-test-store2","key":["store2","base-api-test-group-user1"],"value":{"read":true, "upload:true"}}
 * ]
 * @return {{}}
 * permissions - example structure:
 * {
 *  store1: { read: true, upload: true },
 *  store2: { upload: true }
 * }
 */
function calculatePermissions (couchResult) {
  var _permissions = {}
  couchResult.forEach(function (aclItem, index, array) {
    Object.keys(aclItem.value).forEach(function (permissionKey, index, array) {
      var _store = aclItem.key[ 0 ]
      var _storePermissionObj = _permissions[ _store ] || {}
      var currentValue = _storePermissionObj[ permissionKey ]
      // explicit 'false' - overrides all, otherwise copy the permission
      if (aclItem.value[ permissionKey ] === false) {
        _storePermissionObj[ permissionKey ] = false
      } else if (currentValue !== false) {
        _storePermissionObj[ permissionKey ] = aclItem.value[ permissionKey ]
      }
      _permissions[ _store ] = _storePermissionObj
    })
  })
  return _permissions
}

PermissionResolver.prototype.doResolve = function (username, groups, stores) {
  return new Promise(
    function (resolve, reject) {
      /*
       * Request for permissions
       */
      /* example response
       * {"total_rows":4,"offset":0,"rows":[
       *   {"id":"base-api-test-store1","key":["store1","base-api-test-group-globalAdmins"],"value":{"read":true}},
       *   {"id":"base-api-test-store2","key":["store2","base-api-test-group-globalAdmins"],"value":{"read":true}}
       * ]}
       */
      var queryFilter = { keys: [] }
      stores.forEach(function (store, index, array) {
        groups.forEach(function (group, index, array) {
          queryFilter.keys.push([ store, group ])
        })
      })
      client.post('/acls/_design/couchapp-authentication-utils@acls/_view/viewAclPermissionsByUserOrGroup', queryFilter, function (err, req, res, obj) {
        if (err) {
          reject({ id: 'FAILED_TO_RESOLVE_PERMISSIONS', desc: JSON.stringify(err) })
          return
        } else {
          var _permissions = calculatePermissions(obj.rows)
          resolve({ groups: groups, permissions: _permissions })
        }
      })
    }
  )
}
