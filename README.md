# ES6 Module Bundler

This project allows you to take any ES6 file and get an array of dependencies that make up it's dependency tree.  You can even supply the TreeResolver with alternative paths to resolve modules.  This is a WIP.

```
var TreeResolver = require('es6-tree-resolver');
var treeResolver = new TreeResolver('/app', {
  resolvers: ['./node_modules']
});

var dependencies = treeResolver.resolve('/path/to/es6-module.js');

console.log(dependencies);
// ['fully/qualifed/path/to/dependecy1', 'fully/qualifed/path/to/dependecy2', 'fully/qualifed/path/to/dependecy3']
```
