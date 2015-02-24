var _ = require('underscore'),
  Q = require('q'),
  qClass = require('qpatch').qClass,
  Etcd = qClass(require('node-etcd'), ['watcher']);

function normalize(obj) {
    obj = obj.node || obj;
    // leaf
    if(!_.has(obj, 'nodes')) {
        return _.pick(obj, 'key', 'value');
    }
    return _.flatten(_.map(obj.nodes, normalize));
}

function dump(config) {
  var etcd = new Etcd(config.etcdHost, config.etcdPort);

  function dumpKey(keyDef) {
    return etcd.get(keyDef.key, {
      recursive: keyDef.recursive || false
    })
    .then(normalize).then(function(keys) { return filterKeys(keyDef, keys)});
  }

  if (config.dump === undefined || config.dump.keys === undefined
      || config.dump.keys.length === 0) {
    return Q.reject("No key to dump");
  }

  return Q.allSettled(_.map(config.dump.keys, function(keyDef) {
    return dumpKey(keyDef);
  }));
}

function filterKeys(keyDef, keys) {
  if (keyDef.pattern === undefined || !(keys instanceof Array)) {
    // filter only if we have a pattern and an array
    return keys;
  }

  var re = new RegExp(keyDef.key + keyDef.pattern);
  return _.filter(keys, function(key) {
    return re.test(key.key);
  });
}

function restore(config, allKeys) {
  etcd = new Etcd(config.etcdHost, config.etcdPort);

  return allKeys.reduce(function(a, b) {
    //Flaten array
    return a.concat(b);
  })
  .map(function(item) {
    //Transform keys array into an array of promise
    return  function(index) {
      return etcd.set(item.key, item.value, {}).then(function() {
        console.log("Restored " + item.key);
      },
      function(error) {
        throw new Error("Error setting key : " + item.key);
      }).delay(5)
    }
  })
  //Execute all promises in sequential order
  .reduce(Q.when, Q())



}

module.exports = {
  dump: dump,
  restore: restore
};
