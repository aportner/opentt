var path            = require( 'path' );
var url             = require( 'url' );

function PlaylistHandler()
{
    this.api        = [
        { name: 'list_all', callback: this.handleListAll },
        { name: 'all', callback: this.handleAll, type: 'post' },
        { name: 'new_blocked_song_count', callback: this.handleNewBlockedSongCount },
        { name: 'add', callback: this.handleAdd, type: 'post' },
        { name: 'reorder', callback: this.handleReorder, type: 'post' },
        { name: 'get_metadata', callback: this.handleGetMetadata, type: 'post' }
    ];
}

PlaylistHandler.prototype.init = function()
{
};

PlaylistHandler.prototype.handleListAll = function( req, res, callback )
{
    var _this       = this;
    var url_parts	= url.parse(req.url, true);
    var query		= url_parts.query;

    var user;
    var json;

    if ( query.userid )
    {
        this.db.user.findOne( { _id: query.userid } )
        .populate( 'playlists' )
        .exec( function( err, user )
        {
            if ( !err && user )
            {
                if ( user.playlists.length > 0 )
                {
                    _this.sendPlaylists( user, callback );
                }
                else
                {
                    _this.createDefaultPlaylist( user, callback );
                }
            }
            else
            {
                callback( false, null );
            }
        } );
    }
    else
    {
        callback( false, null );
    }
};

PlaylistHandler.prototype.createDefaultPlaylist = function( user, callback )
{
    var _this       = this;
    var playlist    = new this.db.playlist({ name: 'default', userid: user._id, songs: [] } );

    playlist.save( function( err )
    {
        if ( !err )
        {
            user.playlists.push( playlist );
            user.activePlaylist = playlist.id;

            user.save( function( err )
            {
                if ( !err )
                {
                    _this.sendPlaylists( user, callback );
                }
                else
                {
                    console.error( 'Error saving user', err );
                    callback( false, null );
                }
            })
        }
        else
        {
            console.error( 'Error saving playlist', err );
            callback( false, null );
        }
    } );
};

PlaylistHandler.prototype.sendPlaylists = function( user, callback )
{
    var _this       = this;
    var list        = [];

    user.playlists.forEach( function( playlist )
    {
        list.push( {
            name: playlist.name,
            active: user.activePlaylist == playlist.id
        } );
    } );

    callback( true, { 'list': list } );
};

PlaylistHandler.prototype.handleAll = function( req, res, callback )
{
    var _this       = this;
    var query		= req.body;

    var user;
    var json;

    if ( query.userid && query.playlist_name )
    {
        this.db.playlist.findOne( { userid: query.userid, name: query.playlist_name } )
        .exec( function( err, playlist )
        {
            if ( !err && playlist )
            {
                _this.sendPlaylist( playlist, callback );
            }
            else
            {
                callback( false, null );
            }
        } );
    }
    else
    {
        callback( false, null );
    }
};

PlaylistHandler.prototype.sendPlaylist = function( playlist, callback )
{
    var list        = [];

    playlist.songs.forEach( function( id )
    {
        list.push( { _id: id } );
    } );

    callback( true, { "list": list } );
};

PlaylistHandler.prototype.handleNewBlockedSongCount = function( req, res, callback )
{
    callback( true, { "count": 0 } );
};

PlaylistHandler.prototype.handleAdd = function( req, res, callback )
{
    var _this       = this;
    var query		= req.body;
    var songDict	= query.song_dict;

    this.db.playlist.findOne({ userid: query.userid, name: query.playlist_name})
    .exec( function( err, playlist )
    {
        if ( !err && playlist )
        {
            var start   = 0;

            query.song_dict.forEach( function( songObj )
            {
                if ( songObj.fileid )
                {
                    playlist.songs.splice( start++, 0, songObj.fileid );
                }
            } );

            playlist.save( function( err )
            {
                if ( !err )
                {
                    playlist.populate("songs", function( err )
                    {
                        if ( !err )
                        {
                            var dicts   = [];
                            var len     = playlist.songs.length;

                            for ( var i = 0; i < start; ++i )
                            {
                                dicts.push( playlist.songs[ i ].toSongDict() );
                            }

                            callback( true, { song_dicts: dicts } );
                        }
                        else
                        {
                            console.error( "error populating songs:", err );
                            callback( false, null )
                        }
                    } );
                }
                else
                {
                    console.error( "error saving playlist:", err );
                    callback( false, null )
                }
            } );
        }
        else
        {
            if ( err )
            {
                console.error( 'err loading playlist:', err );
            }

            callback( false, null );
        }
    } )
};

PlaylistHandler.prototype.handleReorder = function( req, res, callback )
{
    var _this       = this;
    var query		= req.body;
    var songDict	= query.song_dict;

    this.db.playlist.findOne({ userid: query.userid, name: query.playlist_name})
    // .populate( 'songs' )
    .exec( function( err, playlist )
    {
        var len         = playlist.songs.length;
        var index_to    = query.index_to;
        var index_from  = query.index_from;

        if ( !err && playlist && index_to >= 0 && index_from >= 0 && index_to < len && index_from < len )
        {
            var fromObj = playlist.songs[ index_from ];
            var toObj   = playlist.songs[ index_to ];

            playlist.songs[ index_to ]      = fromObj;
            playlist.songs[ index_from ]    = toObj;
            playlist.markModified( 'songs' );

            playlist.save( function( err )
            {
                if ( !err )
                {
                    callback( true, {} );
                }
                else
                {
                    console.error( "error saving playlist:", err );
                    callback( false, null )
                }
            } );
        }
        else
        {
            if ( err )
            {
                console.error( 'err loading playlist:', err );
            }

            callback( false, null );
        }
    } );
};

PlaylistHandler.prototype.handleGetMetadata = function( req, res, callback )
{
    var query       = req.body;

    this.db.playlist.findOne( { userid: query.userid, name: query.playlist_name } )
    .populate( 'songs' )
    .exec( function( err, playlist )
    {
        if ( !err && playlist )
        {
            var json    = playlist.getMetadata();
            callback( true, { 'files': json } );
        }
        else
        {
            if ( err )
            {
                console.error( 'error loading playlist:', err );
            }

            callback( false, null );
        }
    });
};

module.exports = PlaylistHandler;
