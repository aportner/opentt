var path            = require( 'path' );
var url             = require( 'url' );

function RoomHandler()
{
    this.api        = [
        { name: 'get_favorites', callback: this.handleGetFavorites },
        { name: 'shortcut_info', callback: this.handleShortcutInfo },
        { name: 'top_tracks', callback: this.handleTopTracks },
        { name: 'directory_graph', callback: this.handleDirectoryGraph }
    ];
}

RoomHandler.prototype.init = function()
{
};

RoomHandler.prototype.handleGetFavorites = function( req, res, callback )
{
    callback( true, {} );
};

RoomHandler.prototype.handleShortcutInfo = function( req, res, callback )
{
    var url_parts	= url.parse(req.url, true);
    var query		= url_parts.query;

    if ( query.shortcut )
    {
        this.db.room.findOne({ shortcut: query.shortcut })
        .exec( function( err, room ) {
            if ( !err && room )
            {
                callback( true, { room: { roomid: room._id } } );
            }
            else if ( err )
            {
                console.err( 'error loading room:', err );
                callback( false, null );
            }
            else
            {
                callback( false, null );
            }
        });
    }
    else
    {
        callback( false, null );
    }
};

RoomHandler.prototype.handleTopTracks = function( req, res, callback )
{
    callback( true, { top_tracks: { tracks: [] } } );
};

RoomHandler.prototype.handleDirectoryGraph = function( req, res, callback )
{
    callback( true, { rooms: [] } );
}

module.exports = RoomHandler;
