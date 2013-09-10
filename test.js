var level = require('level');
var timestamps = require('./');
var test = require('tape');

test('timestamps', function(t) {
  t.plan(9);

  var db = level(__dirname + '/db', {
    valueEncoding: 'json'
  });
  timestamps(db);

  db.del('foo', function(err) {
    db.put('foo', { bar: 'baz' }, function(err) {
      t.error(err);

      db.get('foo', function(err, value) {
        t.error(err);
        t.ok(value.createdAt);
        t.equal(value.createdAt, value.modifiedAt);

        db.put('foo', { bar: 'boop' }, function(err) {
          t.error(err);

          db.get('foo', function(err, value) {
            t.error(err);

            t.ok(value.createdAt);
            t.ok(value.modifiedAt);
            t.notEqual(value.createAt, value.modifiedAt);
          });
        });
      });
    });
  });
});

