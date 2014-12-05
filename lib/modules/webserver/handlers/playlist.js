var path            = require( 'path' );
var url             = require( 'url' );

function PlaylistHandler()
{
    this.api        = [
        { name: 'list_all', callback: this.handleListAll },
        { name: 'all', callback: this.handleAll, type: 'post' },
        { name: 'new_blocked_song_count', callback: this.handleNewBlockedSongCount }
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
                    console.err( 'Error saving user', err );
                    callback( false, null );
                }
            })
        }
        else
        {
            console.err( 'Error saving playlist', err );
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

module.exports = PlaylistHandler;