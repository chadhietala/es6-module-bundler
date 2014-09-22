var expect = require('chai').expect;
var TreeResolver = require('../../lib/tree-resolver');
var fs = require('fs');
var path = require( 'path' );

var treeResolver;
describe('TreeResolver', function () {

  beforeEach( function () {
    treeResolver = new TreeResolver('tests/fixtures/', {
      srcDir: '**/*.js',
      resolvers: 'tests/fake_node_modules/'
    });
  });

  describe( 'constructor', function () {
    it( 'should create a graph', function () {
      var expectation = JSON.stringify(
        JSON.parse( fs.readFileSync( './tests/expectations/graph.json', 'utf8' ) )
      );
      expect( treeResolver.graph ).to.be.an( 'object' );
      expect( JSON.stringify( treeResolver.graph ) ).to.equal( expectation );
    });

    it( 'should have 2 files in the graph', function () {
      var files = Object.keys( treeResolver.graph );
      expect( files.length ).to.equal( 3 );
      expect( files[ 0 ] ).to.equal('tests/fixtures/a.js');
      expect( files[ 1 ] ).to.equal('tests/fixtures/lib/b.js');
      expect( files[ 2 ] ).to.equal('tests/fixtures/lib/c.js');
    });
  });

  describe( '#getImportExports()', function () {
    it( 'should return the imports for a file', function () {
      var imports = Object.keys( treeResolver.getImportExports('tests/fixtures/a.js').imports );
      expect( imports.length ).to.be.equal( 2 );
      expect( imports[ 0 ] ).to.be.equal( 'lib/b' );
    });

    it( 'should return the exports for a file', function () {
      var exports = treeResolver.getImportExports('tests/fixtures/a.js').exports;
      expect( exports.length ).to.be.equal( 1 );
      expect( exports[ 0 ] ).to.be.equal( 'b' );
    });
  });

  describe( '#resolve()', function () {
    it( 'should return all dependencies including transitives outside of the main tree', function () {
      var aDeps = treeResolver.resolve( 'tests/fixtures/a.js' );
      expect( aDeps.length ).to.be.equal( 3 );
      expect( aDeps[ 0 ] ).to.be.equal( process.cwd() + '/tests/fixtures/lib/b.js' );
      expect( aDeps[ 1 ] ).to.be.equal( process.cwd() + '/tests/fixtures/lib/c.js' );
      expect( aDeps[ 2 ] ).to.be.equal( process.cwd() + '/tests/fake_node_modules/foo/baz.js');
    });
  });
});
