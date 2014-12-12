var request         = require( 'request' );
var async           = require( 'async' );
var SpotifyWeb      = require( 'spotify-web' );
var parseString     = require( 'xml2js' ).parseString;
var util            = require( 'util' )

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

            /*
            spotify.search({type:'tracks',query:'hey ya'}, function( err, xml )
            {
                if ( !err && xml )
                {
                    parseString( xml, function( err, result )
                    {
                        console.log(util.inspect(result, false, null))
                    });
                }
            });
            */
        }
    })

    this.onDataCallback = this.onData.bind( this );
    this.events.on( 'songEnd', this.onSongEnd.bind( this ) );
    this.events.on( 'song', this.onSong.bind( this ) );
}

Spotify.prototype.search = function( query, page, callback )
{
    var _this       = this;

    if ( this.spotify )
    {
        var trackString = "spotify:track:";
        if ( query.substr( 0, trackString.length) == trackString )
        {
            _this.getTrack( query, page, callback );
        }
        else
        {
            _this.searchTracks( query.substr( 8 ), page, callback );
        }
    }
    else
    {
        callback( null );
    }
}

Spotify.prototype.getTrack = function( query, page, callback )
{
    var _this       = this;

    if ( page == 1 )
    {
        this.spotify.get( query, function( err, track )
        {
            console.log('track:');
            console.log( track.album.cover[ 0 ] );
            if ( !err && track )
            {
                var song    = _this.songFromJSON( query, track );
                song.save( function( err )
                {
                    if ( !err )
                    {
                        console.log( 'song saved' );
                        callback( [ song.toJSON() ] );
                    }
                    else
                    {
                        console.log( 'song wasnt saved' );
                        _this.db.song.findOne({ mnid: song.mnid }, function( err, song )
                        {
                            console.log( 'song search:', err, song );
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
    else
    {
        callback( [] );
    }
};

Spotify.prototype.searchTracks = function( query, page, callback )
{
    var _this       = this;
    console.log( 'search spot' );

    this.spotify.search( { type: 'tracks', query: query, maxResults: this.config.page, offset: this.config.page * ( page - 1 ) }, function( err, xml )
    {
        if ( !err && xml )
        {
            console.log( 'search spot xml' );
            parseString( xml, function( err, result )
            {
                if ( !err )
                {
                    console.log( 'search spot result' );
                    if ( result && result.result && result.result.tracks && result.result.tracks.length > 0 && result.result.tracks[ 0 ].track )
                    {
                        var tracks  = [];

                        async.each( result.result.tracks[ 0 ].track, function( songObj, cb )
                        {
                            console.log( 'search spot songObj' );
                            var song = _this.songFromSearchJSON( songObj );
                            song.save( function( err ) {
                                if ( !err )
                                {
                                    tracks.push( song.toJSON() );
                                    cb( null );
                                }
                                else
                                {
                                    _this.db.song.findOne({ mnid: song.mnid }, function( err, song )
                                    {
                                        if ( !err && song )
                                        {
                                            tracks.push( song.toJSON() );
                                            cb( null );
                                        }
                                        else
                                        {
                                            console.error('could not save or load song:', err);
                                            cb( err );
                                        }
                                    });
                                }
                            } );
                        }, function( err )
                        {
                            if ( !err )
                            {
                                callback( tracks );
                            }
                            else
                            {
                                callback( null );
                            }
                        });
                    }
                    else
                    {
                        callback( [] );
                    }
                }
                else
                {
                    console.error( 'error parsing xml from spotify:', err );
                    callback( null );
                }
            } );
        }
        else if ( err )
        {
            console.error( 'error searching tracks:', err );
            callback( null );
        }
        else
        {
            callback( [] );
        }
    })
}

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

Spotify.prototype.songFromSearchJSON = function( json )
{
    return new this.db.song( {
        mnid:       SpotifyWeb.id2uri( 'track', json.id[ 0 ] ),
        title:      json.title[ 0 ],
        artist:     json.artist[ 0 ],
        album:      json.album[ 0 ],
        length:     parseInt( json.length[ 0 ], 10 ),
        coverart:   this.spotify.sourceUrls.normal + json.cover[ 0 ],
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
    if ( song.source == this.source )
    {
        var _this       = this;

        this.spotify.get( song.mnid, function( err, track )
        {
            _this.track     = track;
            _this.stream    = track.play();
            _this.streamers = [];
            _this.stream.on( 'data', _this.onDataCallback );
        } );
    }
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
