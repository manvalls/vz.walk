# vz walk

**DEPRECATED in favour of [y-walk](https://www.npmjs.org/package/y-walk "y-walk")**

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


