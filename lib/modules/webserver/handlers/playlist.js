var path            = require( 'path' );
var url             = require( 'url' );
var async           = require( 'async' );
var mongoose        = require( 'mongoose' );

function PlaylistHandler()
{
    this.api        = [
        { name: 'list_all', callback: this.handleListAll },
        { name: 'all', callback: this.handleAll, type: 'post' },
        { name: 'new_blocked_song_count', callback: this.handleNewBlockedSongCount },
        { name: 'add', callback: this.handleAdd, type: 'post' },
        { name: 'reorder', callback: this.handleReorder, type: 'post' },
        { name: 'get_metadata', callback: this.handleGetMetadata, type: 'post' },
        { name: 'remove', callback: this.handleRemove, type: 'post' },
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
            user.activePlaylist = playlist._id;

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
    var userId      = query.userid;
    var name        = query.playlist_name;
    var songDict    = query.song_dict;
    var index       = query.index;
    var songs       = [];

    async.each( songDict, function( songObj, callback )
    {
        _this.db.song.findOne({ "_id": mongoose.Types.ObjectId( songObj.fileid ) }, function( err, song )
        {
            if ( !err && song )
            {
                songs.push( song._id );
            }
            else if ( err )
            {
                console.error( 'error finding song:', err );
            }
            else
            {
                console.error( 'user tried to add missing song:', songObj.fileid );
            }

            callback( err );
        });
    }, function( err )
    {
        if ( !err && songs.length > 0 )
        {
            var obj = {
                $push:
                {
                    songs:
                    {
                        $each: songs
                    }
                }
            };

            if ( index != -1 )
            {
                obj[ '$push' ].songs[ '$position' ] = parseInt( index, 10 );
            }

            console.log( JSON.stringify( obj ) );

            _this.db.playlist.update({ userid: userId, name: name }, obj, function( err )
            {
                if ( !err )
                {
                    _this.db.playlist.findOne( { userid: userId, name: name } )
                    .populate( 'songs' )
                    .exec( function( err, playlist )
                    {
                        if ( !err && playlist )
                        {
                            callback( true, { song_dicts: playlist.getSongDicts() } );
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
                }
                else
                {
                    console.error( 'error adding song:', err );
                    callback( false, null );
                }
            });
        }
        else
        {
            callback( false, null );
        }
    });
}

PlaylistHandler.prototype.handleReorder = function( req, res, callback )
{
    var _this       = this;
    var query		= req.body;
    var songDict	= query.song_dict;
    var userId      = query.userid;
    var name        = query.playlist_name;

    _this.db.playlist.findOne( { userid: userId, name: name } )
    .exec( function( err, playlist )
    {
        if ( !err && playlist )
        {
            var len         = playlist.songs.length;
            var index_to    = query.index_to;
            var index_from  = query.index_from;

            if ( index_to >= 0 && index_from >= 0 && index_to < len && index_from < len )
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
                callback( false, null );
            }
        }
        else
        {
            if ( err )
            {
                console.error('error loading playlist for reorder:', err );
            }

            callback( false, null );
        }
    });
};

PlaylistHandler.prototype.handleGetMetadata = function( req, res, callback )
{
    var query       = req.body;
    var userid      = query.userid;
    var name        = query.playlist_name;
    var handler     = this.tt.modules.socket.getHandlerByUserId(  );

    if ( userid && name )
    {
        this.db.playlist.findOne( { userid: query.userid, name: query.playlist_name } )
        .populate( 'songs' )
        .exec( function( err, playlist )
        {
            if ( !err && playlist )
            {
                callback( true, { 'files': playlist.getMetadata() } );
            }
            else
            {
                if ( err )
                {
                    console.error('error loading playlist metadata:', err );
                }

                callback( false, null );
            }
        });
    }
    else
    {
        callback( false, null );
    }
};

PlaylistHandler.prototype.handleRemove = function( req, res, callback )
{
    var _this       = this;
    var query		= req.body;
    var indexes     = query.index;
    var userId      = query.userid;
    var name        = query.playlist_name;

    this.db.playlist.findOne( { userid: userId, name: name } )
    .populate( 'songs' )
    .exec( function( err, playlist )
    {
        if ( !err && playlist )
        {
            while ( indexes.length > 0 )
            {
                var index   = indexes.pop()
                if ( index >= 0 && index < playlist.songs.length )
                {
                    playlist.songs.splice( index, 1 );
                }
            }

            playlist.markModified( 'songs' );
            playlist.save( function( err )
            {
                if ( !err )
                {
                    callback( true, { song_dict: playlist.getSongDicts() } );
                }
                else
                {
                    console.error( 'error saving playlist after song remove:', err );
                    callback( false, null );
                }
            });
        }
        else
        {
            if ( err )
            {
                console.error( 'error loading playlist for song remove:', err );
            }
            callback( false, null );
        }
    });
}

module.exports = PlaylistHandler;
