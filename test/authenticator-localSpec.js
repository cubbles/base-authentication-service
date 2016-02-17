/*global require,describe,it*/
'use strict'
var assert = require('assert')
var request = require('superagent')
var jwt = require('jsonwebtoken')
var urljoin = require('url-join')
var testdata = require('./_testdata.js')
var opts = {
  // authServiceUrl: 'http://localhost:3000'
  authServiceUrl: 'http://boot2docker.me:3001'
}

describe('authenticator-local', function () {
  it('should respond', function (done) {
    request.get(urljoin(opts.authServiceUrl, '/'))
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .end(function (err, res) {
        if (err) {
          done(err)
          return
        }
        assert.equal(res.body.status, 'ok', 'Expected status == true')
        done(err)
      })
  })

  it('authentication should succeed', function (done) {
    request.post(urljoin(opts.authServiceUrl, '/'))
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('X-Cubx-AuthSecret', 'secret')
      .send('{"user":"' + testdata.users.user3.logins.local.login + '","password":"' + testdata.users.user3.password + '"}')
      .end(function (err, res) {
        if (err) {
          console.log(err)
          done(err)
          return
        }
        var token = res.body.access_token
        assert(token, 'Expected token.')
        var decodedToken = jwt.decode(token)
        assert.equal(decodedToken.user, testdata.users.user3.name, 'Expected the token to contain the username (not the login-name or something else)!')
        done()
      })
  })

  it('authentication should fail due to invalid credentials', function (done) {
    request.post(urljoin(opts.authServiceUrl, '/'))
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('X-Cubx-AuthSecret', 'secret')
      .send('{"user":"' + testdata.users.user3.logins.local.login + '","password":"invalidPassword"}')
      .end(function (err, res) {
        if (!err) {
          assert.ok(false, 'Error expected!')
          done()
          return
        }
        assert.equal(res.statusCode, 403, 'Expected 403.')
        assert.equal(res.body.error, 'invalid_credentials', 'Expected another errorId')
        done()
      })
  })

  it('authentication should fail due to invalid gateway config', function (done) {
    request.post(urljoin(opts.authServiceUrl, '/'))
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      // .set('X-Cubx-AuthSecret', 'secret')
      .send('{"user":"' + testdata.users.user3.logins.local.login + '","password":"' + testdata.users.user3.password + '"}')
      .end(function (err, res) {
        if (!err) {
          assert.ok(false, 'Error expected!')
          done()
          return
        }
        assert(res.statusCode, 403, 'Expected 403.')
        assert(res.body.error, 'invalid_gateway_config', 'Expected another errorId')
        done()
      })
  })

  it('authentication should fail due to USER_NOT_FOUND', function (done) {
    request.post(urljoin(opts.authServiceUrl, '/'))
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('X-Cubx-AuthSecret', 'secret')
      .send('{"user":"api-test-unkown","password":"invalidPassword"}')
      .end(function (err, res) {
        if (!err) {
          assert.ok(false, 'Error expected!')
          done()
          return
        }
        assert.equal(res.statusCode, 403, 'Expected 403.')
        assert.equal(res.body.error, 'USER_NOT_FOUND', 'Expected another error')
        done()
      })
  })

  it('authentication should fail due to MULTIPLE_USERS_FOUND', function (done) {
    request.post(urljoin(opts.authServiceUrl, '/'))
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('X-Cubx-AuthSecret', 'secret')
      .send('{"user":"' + testdata.users.user4.logins.local.login + '","password":"' + testdata.users.user4.password + '"}')
      .end(function (err, res) {
        if (!err) {
          assert.ok(false, 'Error expected!')
          done()
          return
        }
        assert.equal(res.statusCode, 403, 'Expected 403.')
        assert.equal(res.body.error, 'MULTIPLE_USERS_FOUND', 'Expected another error')
        done()
      })
  })
})
