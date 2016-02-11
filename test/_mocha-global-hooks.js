/**
 * Created by hrbu on 24.11.2015.
 * This file implements the global mocha root-level hooks 'before' and 'after'.
 * @see https://mochajs.org/#hooks >> Root-Level Hooks
 *
 * The test suite expects to have a boot2docker-instance running.
 */

/* globals before, after */
'use strict'
require('../authentication-service')
var opts = {
  couchUrl: 'http://admin:admin@boot2docker.me:5984',
  finallyRemoveTestData: true
}
var request = require('superagent')
var supercouch = require('supercouch')
var couch = supercouch(opts.couchUrl)
var userDoc = {
  '_id': 'org.couchdb.user:base-api-test-user',
  'name': 'base-api-test-user',
  'roles': [],
  'type': 'user',
  'password': 'cubbles'
}

before(function (done) {
  console.log('\nbefore ....')
  require('chai').should()

  // create testuser
  function addUser (next) {
    // console.log('Create user: %s', userDoc._id)
    // create a test-user (or re-use one
    couch
      .db('_users')
      .get(userDoc._id)
      .end(function (err, res) {
        if (err) {
          // console.log('requested for existing user - err:', err)
        }
        // return if user does already exist
        if (res) {
          // console.log('requested for existing user -res:', res)
          next()
          return
        }
        // otherwise ... create the user
        couch
          .db('_users')
          .insert(userDoc)
          .end(function (err, res) {
            if (err) {
              console.log('document update failed', err)
              return done(err)
            }
            console.log('Created user %s\n', userDoc._id)
            next()
          })
      })
  }

  // add testuser and test-database
  addUser(done)
})

after(function (done) {
  console.log('\nafter ....')
  function removeUser (next) {
    // console.log('Remove user: %s\n', userDoc._id)
    couch
      .db('_users')
      .get(userDoc._id)
      .end(function (err, res) {
        // console.log('err', err)
        // console.log('res', res)
        if (err) {
          console.log(err)
          return done(err)
        }
        couch
          .db('_users')
          .remove(userDoc._id, res._rev)
          .end(function (err, res) {
            if (err) {
              console.log('Remove User failed!', err)
              return done(err)
            } else {
              console.log('Removed user %s', userDoc._id)
              next()
            }
          })
      })
  }

  function runCompaction () {
    // run a compaction to really remove the users documents
    request.post(opts.couchUrl + '/_users/_compact')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .end(function (err, res) {
        if (err) {
          console.log('Compaction failed.', err)
          return done(err)
        }
        console.log('Compaction triggered.')
        done()
      })
  }

  // remove testuser and test-database

  if (opts.finallyRemoveTestData) {
    removeUser(runCompaction)
  } else {
    done()
  }
})

