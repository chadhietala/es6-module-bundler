var depGraph = require('es-dependency-graph');
var fs = require('fs');
var RSVP = require('rsvp');
var glob = require( 'glob' );
var globFile = RSVP.denodeify( glob );


function GraphResolver( path ) {
  this.path = path;
  this.graph = {};
}

GraphResolver.prototype.build = function () {
  var dfr = RSVP.defer();

  glob( this.path, function (err, files) {
    this._readFiles( files );
    dfr.resolve();
  }.bind( this ));

  return dfr.promise;
};

GraphResolver.prototype.createTree = function ( filePath ) {

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
