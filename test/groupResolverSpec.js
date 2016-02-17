/*global require,describe,beforeEach,it*/
'use strict'
var assert = require('assert')
var request = require('superagent')
var urljoin = require('url-join')
var jwt = require('jsonwebtoken')
var testdata = require('./_testdata.js')
var opts = {
  // authServiceUrl: 'http://localhost:3000'
  authServiceUrl: 'http://boot2docker.me:3001'
}

describe('groupResolver', function () {
  beforeEach(function () {
  })

  it('should resolve groups correctly for Admin1', function (done) {
    var requestBody = {
      user: testdata.users.admin1.logins.local.login,
      password: testdata.users.admin1.password,
      stores: [ 'store1', 'store2' ]
    }
    request.post(urljoin(opts.authServiceUrl, '/'))
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
        assert.equal(decodedToken.groups[ 0 ], testdata.groups.globalAdmins._id, 'Expected another group membership.')
        done()
      })
  })

  it('should resolve groups correctly for User2', function (done) {
    var requestBody = {
      user: testdata.users.user2.logins.local.login,
      password: testdata.users.user2.password,
      stores: [ 'store1', 'store2' ]
    }
    request.post(urljoin(opts.authServiceUrl, '/'))
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
        assert.equal(decodedToken.groups[ 0 ], testdata.groups.group1._id, 'Expected user to be member of group1.')
        assert.equal(decodedToken.groups[ 1 ], testdata.groups.group2._id, 'Expected user to be member of group2.')
        done()
      })
  })
})
