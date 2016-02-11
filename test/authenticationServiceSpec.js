/*global require,describe,beforeEach,it*/
'use strict'
var assert = require('assert')
var request = require('superagent')
var urljoin = require('url-join')
var opts = {
  // authServiceUrl: 'http://localhost:3000'
  authServiceUrl: 'http://boot2docker.me:3001'
}
var user = {
  name: 'base-api-test-user',
  password: 'cubbles'
}

describe('authenticationService', function () {
  beforeEach(function () {
  })

  it('should respond', function (done) {
    request.get(urljoin(opts.authServiceUrl, '/'))
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .end(function (err, res) {
        if (err) {
          done(err)
          return
        }
        assert(res.body.status, true, 'Expected status == true')
        done(err)
      })
  })

  it('authentication should succeed', function (done) {
    request.post(urljoin(opts.authServiceUrl, '/'))
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('X-Cubx-AuthSecret', 'secret')
      .send('{"user":"' + user.name + '","password":"' + user.password + '"}')
      .end(function (err, res) {
        if (err) {
          console.log(err)
          done(err)
          return
        }
        console.log(res.body.access_token)
        assert(res.body.access_token, 'Expected token.')
        done()
      })
  })

  it('authentication should fail due to invalid credentials', function (done) {
    request.post(urljoin(opts.authServiceUrl, '/'))
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('X-Cubx-AuthSecret', 'secret')
      .send('{"user":"' + user.name + '","password":"invalidPassword"}')
      .end(function (err, res) {
        console.log('err:', err)
        console.log('res:', res)
        if (!err) {
          assert.ok(false, 'Error expected!')
          done()
          return
        }
        assert(res.statusCode, 403, 'Expected 403.')
        assert(res.body.error, 'invalid_credentials', 'Expected another errorId')
        done()
      })
  })

  it('authentication should fail due to invalid gateway config', function (done) {
    request.post(urljoin(opts.authServiceUrl, '/'))
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      // .set('X-Cubx-AuthSecret', 'secret')
      .send('{"user":"' + user.name + '","password":"' + user.password + '"}')
      .end(function (err, res) {
        console.log('err:', err)
        console.log('res:', res)
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
})
