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
    SpotifyWeb.login( this.config.username, this.config.password, function( err, spotify )
    {
        console.log( 'spotify:', err, spotify );
    })
}

Spotify.prototype.search = function( query, page, callback )
{
};

module.exports = Spotify;
