var path            = require( 'path' );
var url             = require( 'url' );
var express         = require( 'express' );
var multer          = require( 'multer' );
var mongoose        = require( 'mongoose' );

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
    this.app.use( multer( { dest: this.webServer.www + this.webServer.config.paths.uploads } ) );
    this.app.use( '/images/screens', express.static( this.webServer.www + this.webServer.config.paths.uploads ) );
    this.app.post( '/upload/*', this.handleUpload.bind( this ) );
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
                console.error( 'error loading room:', err );
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

RoomHandler.prototype.handleUpload = function( req, res )
{
    var _this   = this;
    var query   = req.body;
    var files   = req.files;
    var screens = {};
    var key;

    for ( key in files )
    {
        var file        = files[ key ];
        screens[ key ]  = { type: 'image', 0: '/images/screens/' + file.name };
    }

    this.db.room.update( { _id: query.roomid }, { '$set': { screens: screens } }, function( err, updates )
    {
        if ( err )
        {
            console.error( 'error saving screens for room:', err );
        }

        var success = err == null && updates > 0;
        var json    = { success: success };
        res.send( JSON.stringify( json ) );

        if ( success )
        {
            _this.events.emit( 'screens', query.roomid, screens );
        }
    } );
}

module.exports = RoomHandler;
