/* eslint-env node */
'user strict'
var restify = require('restify')
var jwt = require('jsonwebtoken')
var Authenticator4AuthSourceLocal = require('./lib/authenticator-local')
var permissionResolver = new (require('./lib/permissionResolver'))()
var groupResolver = new (require('./lib/groupResolver'))()
var opts = {
  serviceName: 'AuthenticationService',
  servicePort: 3000
}
var server = restify.createServer({
  name: opts.serviceName
})
server.use(restify.bodyParser())
/*
 Throttle load per client to complicate cracking passwords by trail-and-error.
 "If a client has consumed all of their available rate/burst, an HTTP response code of 429 Too Many Requests is returned."
 > http://restify.com/#bundled-plugins > throttle
 > http://stackoverflow.com/questions/18282943/throttle-per-url-in-node-js-restify

 xff: identify the client based on the header 'x-forwarded-for' - set by the base.gateway
 */
var throttleConfig = process.env.BASE_RESTIFY_THROTTLE_CONFIG ? JSON.parse(process.env.BASE_RESTIFY_THROTTLE_CONFIG) : { burst: 7, rate: 5, xff: true }
server.use(restify.throttle(throttleConfig))
server.use(restify.requestLogger())
server.listen(opts.servicePort)
console.log('%s - ' + opts.serviceName + ' started on port ' + opts.servicePort, (new Date()).toISOString())

/*
 * health check
 */
server.get('/', function (req, res, next) {
  res.json(200, { 'status': 'ok' })
  req.log('test')
  next()
})

/*
 * authentication
 */
server.post('/', function (req, res, next) {
  var secret = req.header('X-Cubx-AuthSecret')
  if (!secret || secret.length < 1) {
    var invalid_gateway_config_error = 'invalid_gateway_config'
    res.header('WWW-Authenticate', 'Bearer error="' + invalid_gateway_config_error + '", error_description="The request did not contain a secret to sign the requested token."')
    res.json(403, { error: invalid_gateway_config_error })
    return next()
  }
  console.log('%s - ' + 'Received request for user "%s" from ip "%s"', (new Date()).toISOString(), req.body.user, req.header('x-forwarded-for'))

  function handleAuthenticationError (e) {
    // console.log('createInvalidCredentialsResponse ...', e)
    var authError = e.id ? e.id : 'invalid_credentials'
    var desc = e.desc ? e.desc : 'The request did not contain valid credential information.'
    res.header('WWW-Authenticate', 'Bearer error="' + authError + '", error_description="' + desc + '"')
    res.json(403, { error: authError })
    return next()
  }

  function handleUnexpectedError (e) {
    // console.log('handleUnexpectedError:', e)
    var error = 'unexpected_error'
    res.header('WWW-Authenticate', 'Bearer error="' + error + '", error_description="Unexpected error."')
    res.json(403, { error: error })
    return next()
  }

  /**
   * Create the access_token
   * @param permissions {Object}
   * @param username {String}
   * @return {Promise}
   */
  function createToken (username, groupsAndPermissions) {
    // console.log('createToken ...')
    var payload = {
      user: username,
      groups: groupsAndPermissions.groups,
      permissions: groupsAndPermissions.permissions
    }
    // console.log(payload)
    return new Promise(
      function (resolve, reject) {
        jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: '1h' }, function (token) {
          res.json({ access_token: token })
          resolve()
        })
      })
  }

  function resolveGroups (username, stores) {
    return groupResolver.doResolve(username, Array.isArray(stores) ? stores : [])
  }

  /**
   * Resolve the permissions for the passed user (based on it's username and group-memberships)
   * @param username {String}
   * @param stores {Array}
   * @return {Promise}
   */
  function resolvePermissions (username, groups, stores) {
    return permissionResolver.doResolve(username, groups, Array.isArray(stores) ? stores : [])
  }

  /*
   * Authenticate the user and create the access_token containing username and permissions.
   */
  (new Authenticator4AuthSourceLocal()).authenticate(req.body.user, req.body.password)
    .then(function (username) {
      resolveGroups(username)
        .then(function (groups) {
          resolvePermissions(username, groups, req.body.stores)
            .then(function (groupsAndPermissions) {
              createToken(username, groupsAndPermissions)
            })
            .catch(handleUnexpectedError)
            .done(next)
        })
        .catch(handleUnexpectedError)
        .done(next)
    }, handleAuthenticationError)
})
