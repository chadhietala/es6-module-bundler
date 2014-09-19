var expect = require('chai').expect;
var GraphResolver = require('../../lib/graph-resolver');
var fs = require('fs');

var graphResolver;
describe('GraphResolver', function () {

  beforeEach( function () {
    graphResolver = new GraphResolver('tests/fixtures/**/*.js')
  });


  it( 'should create a graph', function (done) {
    var expectation = JSON.stringify(
      JSON.parse( fs.readFileSync( './tests/expectations/graph.json', 'utf8' ) )
    );

    graphResolver.build().then( function () {
      expect( graphResolver.graph ).to.be.an( 'object' );
      expect( JSON.stringify( graphResolver.graph ) ).to.equal( expectation );
      done();
    });

  });

  it( 'should have 2 files in the graph', function ( done ) {
    graphResolver.build().then( function () {
      var files = Object.keys( graphResolver.graph );
      expect( files.length ).to.equal( 2 );
      expect( files[ 0 ] ).to.equal('tests/fixtures/a.js');
      expect( files[ 1 ] ).to.equal('tests/fixtures/lib/b.js')
      done();
    });
  });

});
