var mongoose        = require( 'mongoose' );

function Database()
{
}

Database.prototype.init = function()
{
    var _this       = this;
    this.mongoose   = mongoose;
    this.mongoose.connect( 'mongodb://' + this.config.host + '/' + this.config.db );

    var db          = this.mongoose.connection;
    db.on( 'error', console.error.bind( console, 'mongodb connection error:' ) );
    db.once( 'open', function() {
        console.log( "Connection to db succeeded" );
        _this.events.emit( 'db' );
    });

    this.initSchemas();
}

Database.prototype.initSchemas = function()
{
    var _this           = this;
    this.schemaNames    = [ 'user', 'avatar', 'room' ];
    this.schemas        = {};

    this.schemaNames.forEach( function( name ) {
        var schema              = require( './schemas/' + name + '.js' );
        _this.schemas[ name ]   = schema;
        _this[ name ]           = mongoose.model( name, schema );
    } );
}

module.exports = Database;
