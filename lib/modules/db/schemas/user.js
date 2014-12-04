var mongoose    = require( 'mongoose' );
var Q           = require( 'q' );

var User        = mongoose.Schema({
    name: String
});

User.methods.register   = function( name )
{

}

module.exports  = User;
