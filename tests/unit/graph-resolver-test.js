var expect = require('chai').expect;
var GraphResolver = require('../../lib/graph-resolver');
var fs = require('fs');
var path = require( 'path' );

var graphResolver;
describe('GraphResolver', function () {

  beforeEach( function () {
    graphResolver = new GraphResolver('tests/fixtures/', '**/*.js')
  });

  describe( 'constructor', function () {
    it( 'should create a graph', function () {
      var expectation = JSON.stringify(
        JSON.parse( fs.readFileSync( './tests/expectations/graph.json', 'utf8' ) )
      );

      expect( graphResolver.graph ).to.be.an( 'object' );
      expect( JSON.stringify( graphResolver.graph ) ).to.equal( expectation );
    });

    it( 'should have 2 files in the graph', function () {
      var files = Object.keys( graphResolver.graph );
      expect( files.length ).to.equal( 3 );
      expect( files[ 0 ] ).to.equal('tests/fixtures/a.js');
      expect( files[ 1 ] ).to.equal('tests/fixtures/lib/b.js');
      expect( files[ 2 ] ).to.equal('tests/fixtures/lib/c.js');
    });
  });

  describe( '#getTree()', function () {
    it( 'should return the imports for a file', function () {
      var imports = Object.keys( graphResolver.getTree('tests/fixtures/a.js').imports );
      expect( imports.length ).to.be.equal( 1 );
      expect( imports[ 0 ] ).to.be.equal( 'lib/b' );
    });

    it( 'should return the exports for a file', function () {
      var exports = graphResolver.getTree('tests/fixtures/a.js').exports;
      expect( exports.length ).to.be.equal( 1 );
      expect( exports[ 0 ] ).to.be.equal( 'b' );
    });
  });

  describe( '#resolvePaths', function () {
    it( 'should return a flat array of fully qualifed paths for a tree', function () {
      var deps = graphResolver.resolveImportPaths(),
          files = Object.keys( deps );

      expect( files.length ).to.be.equal( 3 );
      expect( files[ 0 ] ).to.be.equal( process.cwd() + '/tests/fixtures/a.js');
      expect( deps[ files[0] ].length ).to.be.equal( 1 );
      expect( deps[ files[0] ][ 0 ] ).to.be.equal( process.cwd() + '/tests/fixtures/lib/b.js');
    });
  });

  describe('#resolveDependencyTree', function () {
    it( 'should return all dependencies including transitives', function () {
      var aDeps = graphResolver.resolveDependencyTree('tests/fixtures/a.js');
      expect( aDeps.length ).to.be.equal( 2 );
    });
  });
});
