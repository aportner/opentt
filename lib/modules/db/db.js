var mongoose        = require( 'mongoose' );
var Schemas         = require( './schemas')

function Database()
{
}

Database.prototype.init = function()
{
    this.mongoose   = mongoose;
    this.mongoose.connect( 'mongodb://' + this.config.host + '/' + this.config.db );

    console.log( "Connection to db succeeded" );

    this.initSchemas();
}

Database.prototype.initSchemas = function()
{
    this.schemas    = new Schemas();
}

module.exports = Database;
