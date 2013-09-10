var level = require('level');
var timestamps = require('./');

var db = level(__dirname + '/db', {
  valueEncoding: 'json'
});
timestamps(db);

db.put('foo', { bar: 'baz' }, function(err) {
  if (err) throw err;
  db.get('foo', function(err, value) {
    if (err) throw err;
    console.log(value);
  });
});
