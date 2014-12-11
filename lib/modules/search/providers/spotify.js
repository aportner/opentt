var request         = require( 'request' );
var async           = require( 'async' );
var SpotifyWeb      = require( 'spotify-web' );

function Spotify()
{
}

Spotify.prototype.init = function()
{
    var _this       = this;
    this.source     = 'spotify';

    console.log( 'spotify connecting' );
    SpotifyWeb.login( this.config.username, this.config.password, function( err, spotify )
    {
        if ( err )
        {
            console.log( 'spotify err:', err );
        }
        else
        {
            _this.spotify   = spotify;
            console.log( 'Spotify logged in' );
        }
    })

    this.onDataCallback = this.onData.bind( this );
    this.events.on( 'songEnd', this.onSongEnd.bind( this ) );
    this.events.on( 'song', this.onSong.bind( this ) );
}

Spotify.prototype.search = function( query, page, callback )
{
    var _this       = this;

    if ( this.spotify && page == 1 )
    {
        this.spotify.get( query, function( err, track )
        {
            if ( !err && track )
            {
                var song    = _this.songFromJSON( query, track );
                song.save( function( err )
                {
                    if ( !err )
                    {
                        callback( [ song.toJSON() ] );
                    }
                    else
                    {
                        _this.db.song.findOne({ mnid: song.mnid }, function( err, song )
                        {
                            if ( !err && song )
                            {
                                callback( [ song.toJSON() ] );
                            }
                            else
                            {
                                console.error('could not save or load song:', err);
                                callback( null );
                            }
                        });
                    }
                } );
            }
            else if ( err )
            {
                console.error( 'spotify error getting track:', err );
                callback( null );
            }
            else
            {
                callback( [] );
            }
        } );
    }
    else if ( this.spotify )
    {
        callback( [] );
    }
    else
    {
        callback( null );
    }
};

Spotify.prototype.songFromJSON = function( uri, json )
{
    return new this.db.song( {
        mnid:       uri,
        title:      json.name,
        artist:     json.artist[ 0 ].name,
        album:      json.album.name,
        length:     json.duration,
        coverart:   json.album.cover[ 0 ].uri,
        source:     this.source
    } );
};

Spotify.prototype.previewFile = function( song, req, res )
{
    if ( this.track != null )
    {
        res.set( 'Content-Type', 'audio/mpeg' );
        this.streamers.push( res );
    }
    else
    {
        res.status(404);
        res.end('error');
    }
}

Spotify.prototype.onSong = function( song )
{
    var _this       = this;

    this.spotify.get( song.mnid, function( err, track )
    {
        _this.track     = track;
        _this.stream    = track.play();
        _this.streamers = [];
        _this.stream.on( 'data', _this.onDataCallback );
    } )
}

Spotify.prototype.onSongEnd = function()
{
    if ( this.streamers )
    {
        this.streamers.forEach( function( streamer )
        {
            streamer.end();
        } );

        this.streamers  = null;
    }

    if ( this.stream )
    {
        this.stream.removeListener( 'data', this.onDataCallback );
        this.stream = null;
    }

    this.track = null;
}

Spotify.prototype.onData = function( data )
{
    this.streamers.forEach( function( streamer ) {
        streamer.write( data );
    });
}

module.exports = Spotify;
