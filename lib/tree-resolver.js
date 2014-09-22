var depGraph = require('es-dependency-graph');
var fs = require('fs');
var RSVP = require('rsvp');
var glob = require( 'glob' );
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

function TreeResolver( tree, options ) {
  if ( !options.srcDir ) {
    throw new Error( 'You must supply a source directroy.')
  }
  this.tree = tree;
  this.srcDir = options.srcDir;
  this.resolvers = [ this.tree ];

  if ( options.resolvers ) {
    if ( typeof options.resolvers === 'string' ) {
      this.resolvers.push( options.resolvers );
    } else {
      this.resolvers.concat( options.resolvers );
    }
  }

  this.graph = {};

  if ( this.srcDir ) {
    this._build();
  }
}

TreeResolver.prototype.getImportExports = function ( filePath ) {
  var files;

  if ( !this.graph ) {
    this._build( this.srcDir );
  }

  if ( this.graph[ filePath ] ) {
    return this.graph[ filePath ];
  }

  return {};
};

TreeResolver.prototype.resolve = function ( depPath ) {
  var resolvedImportGraph = this._resolveImportPaths(),
      entryNodeDeps = resolvedImportGraph[ path.resolve( depPath ) ];

  return flatten(entryNodeDeps.map(function (dep) {
    var localDep = resolvedImportGraph[ dep ];
    if ( localDep && localDep.length > 0 ) {
      return [ dep, flatten( resolvedImportGraph[ dep ] ) ];
    } else {
      return [ dep ];
    }
  }));
};

TreeResolver.prototype._build = function () {
  var files = glob.sync( this.tree + this.srcDir );
  this._readFiles( files );
};

TreeResolver.prototype._resolveImportPaths = function () {
  var clonedGraph = cloneDeep( this.graph );

  Object.keys( clonedGraph ).map( function ( node ) {
    var imports = Object.keys( this.graph[ node ].imports );

    clonedGraph[ path.resolve( node ) ] = imports.map( function ( relativeImportPath ) {
      var js = '.js';

      if ( relativeImportPath.charAt( 0 ) !== '.' ) {
        return resolve.sync( relativeImportPath, {
          extensions: [ js ],
          moduleDirectory: this.resolvers
        });
      }

      return path.resolve( resolveRelativeModule( relativeImportPath, node ) + js );
    }, this );

    delete clonedGraph[ node ];
  }, this );

  return clonedGraph;
};

TreeResolver.prototype._readFiles = function ( files ) {
  files.forEach( function ( filePath ) {
    var file = fs.readFileSync( filePath, 'utf8' );
    this._walk( filePath, file );
  }, this );
};

TreeResolver.prototype._walk = function ( filePath, file ) {
  this.graph[ filePath ] = depGraph( file, {
    includeBindings: true
  });
};

module.exports = TreeResolver;
