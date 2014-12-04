var path            = require( 'path' );
var url             = require( 'url' );

function UserHandler()
{

}

UserHandler.prototype.init = function()
{
    this.app.get( '/api/user.authenticate', this.handleUserAuthenticate.bind( this ) );
    this.app.get( '/api/user.info', this.handleUserInfo.bind( this ) );
    this.app.get( '/api/user.get_fan_of', this.handleGetFanOf.bind( this ) );
    this.app.get( '/api/user.get_buddies', this.handleGetBuddies.bind( this ) );
}

UserHandler.prototype.handleUserAuthenticate = function (req, res)
{
    var _this       = this;
    var url_parts	= url.parse(req.url, true);
    var query		= url_parts.query;

    var user;
    var json;

    res.setHeader('Content-Type', 'application/json')

    if ( query.userid )
    {
        this.db.user.findOne( { _id: query.userid }, function( err, user )
        {
            json    = !err && user ? [ true, { name: user.name } ] : [ false, null ];
            res.end( JSON.stringify( json ) );
        } );
    }
    else
    {
        json = [ false, null ];
        res.end( JSON.stringify( json ) );
    }
};

UserHandler.prototype.handleUserInfo = function( req, res )
{
    var url_parts	= url.parse(req.url, true);
    var query		= url_parts.query;

    var user;
    var json;

    res.setHeader('Content-Type', 'application/json');

    if ( query.userid )
    {
        this.db.user.findOne( { _id: query.userid }, function( err, user )
        {
            json    = !err && user ? [ true, user.toJSON() ] : [ false, null ];
            res.end( JSON.stringify( json ) );
        } );
    }
    else
    {
        json = [ false, null ];
        res.end( JSON.stringify( json ) );
    }
};

UserHandler.prototype.handleGetFanOf = function( req, res )
{
    var url_parts	= url.parse(req.url, true);
    var query		= url_parts.query;

    var user;
    var json;

    res.setHeader('Content-Type', 'application/json');

    if ( query.userid )
    {
        this.db.user.findOne( { _id: query.userid }, function( err, user )
        {
            json    = !err && user ? [ true, { fanof: user.fanOf } ] : [ false, null ];
            res.end( JSON.stringify( json ) );
        } );
    }
    else
    {
        json = [ false, null ];
        res.end( JSON.stringify( json ) );
    }
};


UserHandler.prototype.handleGetBuddies = function( req, res )
{
    res.setHeader('Content-Type', 'application/json');
    var json = [ true, { buddies: [] } ];
    res.end( JSON.stringify( json ) );
};

module.exports = UserHandler;
