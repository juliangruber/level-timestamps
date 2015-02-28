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
            db.close();
          });
        });
      });
    });
  });
});

test('batch', function (t) {
  t.plan(12);

  var db = level(__dirname + '/db', {
    valueEncoding: 'json'
  });
  timestamps(db);

  db.createReadStream().on('data', function (item) {
    db.del(item.key);
  })
  .on('end', function () {
    var rows = [
      {key: 'bar', value: { foo: 'bar' }, type: 'put'},
      {key: 'baz', value: { foo: 'baz' }, type: 'put'}
    ];
    db.batch(rows, function (err) {
      t.error(err);
      db.createReadStream()
        .on('data', function (item) {
          t.ok(item.value.createdAt);
          t.equal(item.value.createdAt, item.value.modifiedAt);
        })
        .on('end', function () {
          db.batch(rows, function (err) {
            t.error(err);
            db.createReadStream()
              .on('data', function (item) {
                t.ok(item.value.createdAt);
                t.ok(item.value.modifiedAt);
                t.notEqual(item.value.createdAt, item.value.modifiedAt);
                db.close();
              });
          });
        });
    });
  });
})
