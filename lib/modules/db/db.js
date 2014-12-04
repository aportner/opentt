var mongoose        = require( 'mongoose' );
var schemas         = require( './schemas')

function Database()
{
}

Database.prototype.init = function()
{
    this.mongoose   = mongoose;
    this.mongoose.connect( 'mongodb://' + this.config.host + '/' + this.config.db );

    console.log( "Connection to db succeeded" );
}

module.exports = Database;
