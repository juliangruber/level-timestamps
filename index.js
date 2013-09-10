module.exports = timestamps;

function timestamps(db) {
  var put = db.put;
  var batch = db.batch;

  function getValue(key, value, fn) {
    var modified;
    db.get(key, function(err, old) {
      if (err && err.name != 'NotFoundError') return fn(err);
      modified = !err;

      if (modified) {
        value.createdAt = old.createdAt;
        value.modifiedAt = Date.now();
      } else {
        value.createdAt =
        value.modifiedAt = Date.now();
      }

      fn(null, value);
    });
  
  }
  
  db.put = function(key, value, fn) {
    getValue(key, value, function(err, value) {
      if (err) return fn(err);

      put.call(db, key, value, fn);
    });
  };

  db.batch = function(ops, fn) {
    function next(i) {
      var op = ops[i];
      if (!op) return write();
      
      getValue(op.key, op.value, function(err, value) {
        if (err) return fn(err);
        op.value = value;
        next(i + 1);
      });
    }

    next(0);

    function write() {
      batch.call(db, ops);
    }
  };

  return db;
}
