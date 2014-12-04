var path            = require( 'path' );
var url             = require( 'url' );

function AvatarHandler()
{

}

AvatarHandler.prototype.init = function()
{
    this.events.on( 'avatars', this.handleAvatars.bind( this ) );

    this.app.get( '/api/avatar.all', this.handleAvatarAll.bind( this ) );
};

AvatarHandler.prototype.handleAvatars = function()
{
    var _this       = this;
    this.avatars    = {};

    this.db.avatar.find( {}, function( err, avatars )
    {
        if ( !err )
        {
            avatars.forEach( function( avatar ) {
                _this.avatars[ avatar.avatarid ] = avatar;
            } );
        }
        else
        {
            console.err( "Error loading avatars from db: " + err )
        }
    });
};

AvatarHandler.prototype.handleAvatarAll = function( req, res )
{
    res.setHeader('Content-Type', 'application/json');

    var json =
    [
        true,
        {
            avatars: this.avatars
        }
    ];
    res.end( JSON.stringify( json ) );
};

module.exports = AvatarHandler;
