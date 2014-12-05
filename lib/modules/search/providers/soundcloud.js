var request         = require( 'request' );

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

            for ( var ndx = 0; ndx < scj.length; ++ndx )
            {
                var song = _this.songFromJSON( scj[ ndx ] );
                song.save();

                tracks.push( song.toJSON() );
            }

            callback( tracks );
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
