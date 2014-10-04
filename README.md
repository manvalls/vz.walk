# vz walk

[![NPM](https://nodei.co/npm/vz.walk.png?downloads=true)](https://nodei.co/npm/vz.walk/)

No piece of software is ever completed, feel free to contribute and be humble

## Sample usage:

```javascript

var walk = require('vz.walk'),
    yieldify = require('vz.yieldify'),
    fs = require('fs'),
    exists = yieldify(fs.exists);

walk(function*(){
  if(yield exists('foo.bar')) console.log('foo.bar exists!');
  else console.log('foo.bar doesn\'t exist');
});

```


