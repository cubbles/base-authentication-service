/* eslint-env node */
'user strict'
var restify = require('restify')
var jwt = require('jsonwebtoken')
var BaseAuthenticator = require('./lib/base-authenticator')
var authenticator = new BaseAuthenticator()
var PermissionResolver = require('./lib/permission-resolver')
var permissionResolver = new PermissionResolver()

module.export = function () {
  console.log('#########')
}

var server = restify.createServer({
  name: 'AuthenticationService'
})

server.use(restify.bodyParser())
server.listen(3000)
console.log('Service started.')

// server.on('after', restify.auditLogger({
//  log: bunyan.createLogger({
//    name: 'audit',
//    stream: process.stdout
//  })
// }))

server.get('/', function (req, res, next) {
  res.json(200, { 'status': 'ok' })
  next()
})

server.post('/', function (req, res, next) {
  var secret = req.header('X-Cubx-AuthSecret')
  if (!secret || secret.length < 1) {
    var invalid_gateway_config_error = 'invalid_gateway_config'
    res.header('WWW-Authenticate', 'Bearer error="' + invalid_gateway_config_error + '", error_description="The request did not contain a secret to sign the requested token."')
    res.json(403, { error: invalid_gateway_config_error })
    return next()
  }

  function handleAuthenticationError () {
    console.log('createInvalidCredentialsResponse ...')
    var invalid_credentials_error = 'invalid_credentials'
    res.header('WWW-Authenticate', 'Bearer error="' + invalid_credentials_error + '", error_description="The request did not contain valid credential information."')
    res.json(403, { error: invalid_credentials_error })
    return next()
  }

  function handleUnexpectedError (e) {
    console.log('handleUnexpectedError:', e)
    var error = 'unexpected_error'
    res.header('WWW-Authenticate', 'Bearer error="' + error + '", error_description="Unexpected error."')
    res.json(403, { error: error })
    return next()
  }

  function createToken (permissions) {
    console.log('createToken ...')
    var payload = {
      user: req.body.user,
      permissions: permissions
    }
    return new Promise(
      function (resolve, reject) {
        jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: '1h' }, function (token) {
          res.json({ access_token: token })
          resolve()
        })
      })
  }

  function resolvePermissions () {
    return permissionResolver.doResolve(req.body.user, req.body.stores)
  }

  authenticator.authenticate(req.body.user, req.body.password)
    .then(function () {
      resolvePermissions()
        .then(createToken)
        .then(next)
        .catch(handleUnexpectedError)
    }, handleAuthenticationError)
})
