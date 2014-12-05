var path            = require( 'path' );
var url             = require( 'url' );

function RoomHandler()
{
    this.api        = [
        { name: 'get_favorites', callback: this.handleGetFavorites }
    ];
}

RoomHandler.prototype.init = function()
{
};

RoomHandler.prototype.handleGetFavorites = function( req, res, callback )
{
    callback( true, {} );
};

module.exports = RoomHandler;
