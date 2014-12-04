function Schemas()
{
    this.names  = [ 'user' ];
    this.init();
}

Schemas.prototype.init = function()
{
    var _this       = this;
    this.schemas    = {};

    this.schemas.forEach( function( name ) {
        var schema  = require( './' + name + '.js' );
        _this.schemas[ name ]   = schema;
    } );
}

module.exports = Schemas;
