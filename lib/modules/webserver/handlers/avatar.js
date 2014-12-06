var path            = require( 'path' );
var url             = require( 'url' );

function AvatarHandler()
{
    this.api        = [
        { name: 'all', callback: this.handleAvatarAll },
    ];
}

AvatarHandler.prototype.init = function()
{
    var _this       = this;
    this.dir        = path.dirname( require.main.filename );

    this.events.on( 'avatars', this.handleAvatars.bind( this ) );
    this.app.get('/profile/avatar', function ( req, res ) { res.end('ok'); });
    this.app.get('/api/user.available_avatars', this.handleAvailableAvatarsProxy.bind( this ) );
    this.app.get('/roommanager_assets/avatars/*/fullfront.png', function( req, res ) {
        res.sendFile( _this.dir + "/avatars/" + req.params[0] + "_fullfront.png" );
    });
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
            console.error( "Error loading avatars from db: " + err )
        }
    });
};

AvatarHandler.prototype.handleAvatarAll = function( req, res, callback )
{
    callback( true, { avatars: this.avatars } );
};

AvatarHandler.prototype.handleAvailableAvatarsProxy = function( req, res )
{
    this.handleAvailableAvatars( req, res, function( success, json )
    {
        res.setHeader('Content-Type', 'application/json');
        var response    = [ success, json ];
        res.end( JSON.stringify( response ) );
    } );
}

AvatarHandler.prototype.handleAvailableAvatars = function ( req, res, callback )
{
    var avatarsJSON = [];
    var avatarJSON = {
        avatarids: [],
        title: "Avatars",
        min: 0,
        acl: 0
    }

    for ( var id in this.avatars )
    {
        avatarJSON.avatarids.push( id );
    }

    avatarsJSON.push( avatarJSON );

    var json = {
        "avatars": avatarsJSON,
    };

    callback( true, json );
};

module.exports = AvatarHandler;
