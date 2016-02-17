module.exports = {
  users: {
    admin1: {
      _id: 'org.couchdb.user:123admin1',
      name: '123admin1',
      displayName: 'admin1',
      email: 'admin1@cubbles.test',
      logins: {
        local: {
          login: 'admin1'
        }
      },
      roles: [],
      type: 'user',
      password: 'cubbles'
    },
    user1: {
      _id: 'org.couchdb.user:123user1',
      name: '123user1',
      displayName: 'user1',
      email: 'user1@cubbles.test',
      logins: {
        local: {
          login: 'user1'
        }
      },
      roles: [],
      type: 'user',
      password: 'cubbles'
    },
    user2: {
      _id: 'org.couchdb.user:123user2',
      name: '123user2',
      displayName: 'user2',
      email: 'user2@cubbles.test',
      logins: {
        local: {
          login: 'user2'
        }
      },
      roles: [],
      type: 'user',
      password: 'cubbles'
    },
    user3: {
      _id: 'org.couchdb.user:123user3',
      name: '123user3',
      displayName: 'user3',
      email: 'user3@cubbles.test',
      logins: {
        local: {
          login: 'user3'
        }
      },
      roles: [],
      type: 'user',
      password: 'cubbles'
    },
    user4: {
      _id: 'org.couchdb.user:123user4',
      name: '123user4',
      displayName: 'user4',
      email: 'user4@cubbles.test',
      logins: {
        local: {
          login: 'user4'
        }
      },
      roles: [],
      type: 'user',
      password: 'cubbles'
    },
    user4DuplicateLocal: {
      _id: 'org.couchdb.user:123user4DuplicateLocal',
      name: '123user4DuplicateLocal',
      displayName: 'user4',
      email: 'user4@cubbles.test',
      logins: {
        local: {
          login: 'user4'
        }
      },
      roles: [],
      type: 'user',
      password: 'cubbles'
    },
    user5Inactive: {
      _id: 'org.couchdb.user:123user5',
      name: '123user5',
      displayName: 'user5',
      email: 'user5@cubbles.test',
      inactive: true,
      logins: {
        local: {
          login: 'user5'
        }
      },
      roles: [],
      type: 'user',
      password: 'cubbles'
    }
  },
  groups: {
    globalAdmins: {
      _id: 'base-api-test-group-globalAdmins',
      displayName: 'API Test: globalAdmins',
      docType: 'group',
      users: [
        '123admin1'
      ]
    },
    group1: {
      _id: 'base-api-test-group1',
      displayName: 'API Test: Group1',
      docType: 'group',
      users: [
        '123user1',
        '123user2',
        '123user3'
      ]
    },
    group2: {
      _id: 'base-api-test-group2',
      displayName: 'API Test: Group2',
      docType: 'group',
      users: [
        '123user2'
      ]
    }
  },
  acls: {
    aclStore1: {
      _id: 'base-api-test-store1',
      docType: 'acl',
      store: 'store1',
      permissions: {
        'base-api-test-group-globalAdmins': {
          read: true
        },
        'base-api-test-group1': {
          upload: true,
          read: true
        }
      }
    },
    aclStore2: {
      _id: 'base-api-test-store2',
      docType: 'acl',
      store: 'store2',
      permissions: {
        'base-api-test-group-globalAdmins': {
          read: true
        },
        'base-api-test-group1': {
          upload: false,
          read: true
        },
        'base-api-test-group2': {
          upload: true,
          read: true
        }
      }
    }
  }
}
