var request         = require( 'request' );
var async           = require( 'async' );

function SoundCloud()
{
}

SoundCloud.prototype.init = function()
{
    this.source     = 'sc';
}

SoundCloud.prototype.search = function( query, page, callback )
{
    var _this       = this;

    console.log(' searching ');

    request.get( 'http://api.soundcloud.com/tracks.json?client_id=' + this.config.id
     + '&q=' + encodeURIComponent( query ) + "&limit=" + this.config.page + "&offset="
     + ( this.config.page * ( page - 1 ) ), function( error, response, body )
    {
        if ( !error )
        {
            var scj	= JSON.parse( body );
            var tracks = [];

            async.each( scj, function( songObj, cb )
            {
                var song = _this.songFromJSON( songObj );
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
            callback( null )
        }
    });
};

SoundCloud.prototype.songFromJSON = function( json )
{
    return new this.db.song( {
        mnid:       this.source + "_" + json.id,
        title:      json.title,
        artist:     json.user.username,
        album:      '',
        length:     json.duration,
        coverart:   json.artwork_url,
        source:     this.source
    } );
};

module.exports = SoundCloud;
