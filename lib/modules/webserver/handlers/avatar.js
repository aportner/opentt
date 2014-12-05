var path            = require( 'path' );
var url             = require( 'url' );

function AvatarHandler()
{
    this.api        = [
        { name: 'all', callback: this.handleAvatarAll }
    ];
}

AvatarHandler.prototype.init = function()
{
    this.events.on( 'avatars', this.handleAvatars.bind( this ) );
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

AvatarHandler.prototype.handleAvatarAll = function( req, res, callback )
{
    callback( true, { avatars: this.avatars } );
};

module.exports = AvatarHandler;
