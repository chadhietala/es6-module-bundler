var depGraph = require('es-dependency-graph');
var fs = require('fs');
var RSVP = require('rsvp');
var glob = require( 'glob' );
var globFile = RSVP.denodeify( glob );
var cloneDeep = require('lodash-node/modern/objects/cloneDeep');
var path = require( 'path' );
var resolve = require( 'resolve' );

function resolveRelativeModule(child, name) {

  var parts = child.split('/');
  var nameParts = name.split('/');
  var parentBase = nameParts.slice(0, -1);

  for (var i = 0, l = parts.length; i < l; i++) {
    var part = parts[i];

    if (part === '..') { parentBase.pop(); }
    else if (part === '.') { continue; }
    else { parentBase.push(part); }
  }

  return parentBase.join('/');
}

var flatten = function ( arry ) {
  return arry.reduce( function ( a, b ) {
    return a.concat( b );
  });
};

function GraphResolver( tree, srcDir ) {
  this.tree = tree;
  this.srcDir = srcDir;
  this.graph = {};

  if ( this.srcDir ) {
    this._build();
  }
}

GraphResolver.prototype._build = function () {
  var files = glob.sync( this.tree + this.srcDir );
  this._readFiles( files );
};

GraphResolver.prototype.getTree = function ( filePath ) {
  var files;

  if ( !this.graph ) {
    this._build( this.srcDir );
  }

  if ( this.graph[ filePath ] ) {
    return this.graph[ filePath ];
  }

  return {};
};

GraphResolver.prototype.resolveImportPaths = function () {
  var clonedGraph = cloneDeep( this.graph );


  Object.keys( clonedGraph ).map( function ( node ) {
    var imports = Object.keys( this.graph[ node ].imports );

    clonedGraph[ path.resolve( node ) ] = imports.map( function ( relativeImportPath ) {
      var js = '.js';

      if ( relativeImportPath.charAt( 0 ) !== '.' ) {
        return resolve.sync( relativeImportPath, {
          extensions: [ js ],
          moduleDirectory: this.tree
        });
      }

      return path.resolve( resolveRelativeModule( relativeImportPath, node ) + js );
    }, this );

    delete clonedGraph[ node ];
  }, this );

  return clonedGraph;
};

GraphResolver.prototype.resolveDependencyTree = function ( depPath ) {
  var resolvedImportGraph = this.resolveImportPaths(),
      entryNodeDeps = resolvedImportGraph[ path.resolve( depPath ) ];

  return flatten(entryNodeDeps.map(function (dep) {
    if ( resolvedImportGraph[ dep ].length > 0 ) {
      return [ dep, flatten( resolvedImportGraph[ dep ] ) ];
    } else {
      return [ dep ];
    }
  }));


};

GraphResolver.prototype._readFiles = function ( files ) {
  files.forEach( function ( filePath ) {
    var file = fs.readFileSync( filePath, 'utf8' );
    this._walk( filePath, file );
  }, this );
};

GraphResolver.prototype._walk = function ( filePath, file ) {
  this.graph[ filePath ] = depGraph( file, {
    includeBindings: true
  });
};

module.exports = GraphResolver;
