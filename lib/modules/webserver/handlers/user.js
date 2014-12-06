var path            = require( 'path' );
var url             = require( 'url' );

function UserHandler()
{
    this.api        = [
        { name: 'authenticate', callback: this.handleUserAuthenticate },
        { name: 'info', callback: this.handleUserInfo },
        { name: 'get_fan_of', callback: this.handleGetFanOf },
        { name: 'get_buddies', callback: this.handleGetBuddies },
        { name: 'get_prefs', callback: this.handleGetPrefs },
        { name: 'edit_prefs', callback: this.handleEditPrefs, type: 'post' },
        { name: 'get_profile_info', callback: this.handleGetProfileInfo },
        { name: 'set_avatar', callback: this.handleSetAvatar }
    ];
}

UserHandler.prototype.init = function()
{
}

UserHandler.prototype.handleUserAuthenticate = function( req, res, callback )
{
    var _this       = this;
    var url_parts	= url.parse(req.url, true);
    var query		= url_parts.query;

    var user;
    var json;

    if ( query.userid )
    {
        this.db.user.findOne( { _id: query.userid }, function( err, user )
        {
            if ( !err && user )
            {
                callback( true, { name: user.name } );
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

UserHandler.prototype.handleUserInfo = function( req, res, callback )
{
    var url_parts	= url.parse(req.url, true);
    var query		= url_parts.query;

    var user;
    var json;

    if ( query.userid )
    {
        this.db.user.findOne( { _id: query.userid }, function( err, user )
        {
            if ( !err && user )
            {
                callback( true, user.toJSON() );
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

UserHandler.prototype.handleGetFanOf = function( req, res, callback )
{
    var url_parts	= url.parse(req.url, true);
    var query		= url_parts.query;

    var user;
    var json;

    if ( query.userid )
    {
        this.db.user.findOne( { _id: query.userid }, function( err, user )
        {
            if ( !err && user )
            {
                callback( true, { fanof: user.fanOf } );
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


UserHandler.prototype.handleGetBuddies = function( req, res, callback )
{
    callback( true, { buddies: [] } );
};

UserHandler.prototype.handleGetPrefs = function ( req, res, callback )
{
    callback( true, {} );
};

UserHandler.prototype.handleEditPrefs = function( req, res, callback )
{
    callback( true, {} );
}

UserHandler.prototype.handleGetProfileInfo = function ( req, res, callback )
{
    var url_parts	= url.parse(req.url, true);
    var query		= url_parts.query;
    var userid      = query.profileid;

    if ( userid )
    {
        this.db.user.findOne( { _id: userid }, function( err, user )
        {
            if ( !err && user )
            {
                callback( true, user.toJSON() );
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

UserHandler.prototype.handleSetAvatar = function( req, res, callback )
{
    var _this       = this;
    var url_parts	= url.parse(req.url, true);
    var query		= url_parts.query;
    var userid      = query.userid;
    var avatarid 	= query.avatarid;

    if ( userid )
    {
        this.db.user.findOne( { _id: userid }, function( err, user )
        {
            if ( !err && user )
            {
                user.avatarid   = avatarid;
                user.save( function( err ) {
                    if ( !err )
                    {
                        _this.events.emit( 'avatar', userid, avatarid );
                        callback( true, {} );
                    }
                    else
                    {
                        console.error( 'error saving user:', err );
                        callback( false, null );
                    }
                } );
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

module.exports = UserHandler;
