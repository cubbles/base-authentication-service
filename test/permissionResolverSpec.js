/*global require,describe,beforeEach,it*/
'use strict'
var assert = require('assert')
var request = require('superagent')
var urljoin = require('url-join')
var jwt = require('jsonwebtoken')
var testdata = require('./_testdata.js')
var opts = {
  // authServiceUrl: 'http://localhost:3000'
  authServiceGatewayUrl: 'http://boot2docker.me/_api/authenticate'
}

describe('permissionResolver', function () {
  beforeEach(function () {
  })

  it('should resolve permissions correctly for Admin1', function (done) {
    var requestBody = {
      user: testdata.users.admin1.logins.local.login,
      password: testdata.users.admin1.password,
      stores: [ 'store1', 'store2' ]
    }
    request.post(urljoin(opts.authServiceGatewayUrl, '/'))
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('X-Cubx-AuthSecret', 'secret')
      .send(JSON.stringify(requestBody))
      .end(function (err, res) {
        if (err) {
          console.log(err)
          done(err)
          return
        }
        var token = res.body.access_token
        assert(token, 'Expected token.')
        var decodedToken = jwt.decode(token)
        // console.log(decodedToken)
        assert.equal(decodedToken.user, testdata.users.admin1.name, 'Expected the token to contain the username (not the login-name or something else)!')
        assert.equal(decodedToken.groups.length, 1, 'Expected user to be in ONE group.')
        assert.deepEqual(decodedToken.permissions[ testdata.acls.aclStore1.store ], testdata.acls.aclStore1.permissions[ 'base-api-test-group-globalAdmins' ], 'Expected other permissions.')
        assert.deepEqual(decodedToken.permissions[ testdata.acls.aclStore2.store ], testdata.acls.aclStore2.permissions[ 'base-api-test-group-globalAdmins' ], 'Expected other permissions.')
        done()
      })
  })

  it('should resolve permissions correctly for User2', function (done) {
    var requestBody = {
      user: testdata.users.user2.logins.local.login,
      password: testdata.users.user2.password,
      stores: [ 'store1', 'store2', 'store3' ]
    }
    request.post(urljoin(opts.authServiceGatewayUrl, '/'))
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('X-Cubx-AuthSecret', 'secret')
      .send(JSON.stringify(requestBody))
      .end(function (err, res) {
        if (err) {
          console.log(err)
          done(err)
          return
        }
        var token = res.body.access_token
        assert(token, 'Expected token.')
        var decodedToken = jwt.decode(token)
        // console.log(decodedToken)
        assert.equal(decodedToken.user, testdata.users.user2.name, 'Expected the token to contain the username (not the login-name or something else)!')
        assert.equal(decodedToken.groups.length, 2, 'Expected user to be in TWO groups.')
        assert.deepEqual(decodedToken.permissions[ testdata.acls.aclStore1.store ], testdata.acls.aclStore1.permissions[ 'base-api-test-group1' ], 'Expected other permissions.')
        assert.deepEqual(decodedToken.permissions[ testdata.acls.aclStore2.store ].read, true, 'Expected "true"')
        assert.deepEqual(decodedToken.permissions[ testdata.acls.aclStore2.store ].upload, false, 'Expected "false", as User2 is member of Group1 too, which does EXPLICITELY NOT have upload permissions.')
        done()
      })
  })
})
