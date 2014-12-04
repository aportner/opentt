var express         = require( 'express' );
var path            = require( 'path' );
var url             = require( 'url' );

function WebServer()
{

}

WebServer.prototype.init = function()
{
    this.dir        = path.dirname( require.main.filename );
    this.www        = this.dir + '/' + this.config.paths.www + '/';
    this.db         = this.tt.modules.db;

    this.app.get( '/room', this.handleRoom.bind( this ) );
    this.app.use( '/static', express.static( this.www + this.config.paths.static ) );
    this.app.use( '/roommanager_assets', express.static( this.www + this.config.paths.roomManagerAssets ) );

    this.app.post( '/login', this.handleLogin.bind( this ) );
    this.app.post( '/register', this.handleRegister.bind( this ) );

    this.initHandlers();
}

WebServer.prototype.initHandlers = function()
{
    var _this       = this;
    var handlers    = [ 'user', 'avatar' ];

    handlers.forEach( function( name )
    {
        var handlerClass    = require( './handlers/' + name + '.js' );
        var handler         = new handlerClass();

        handler.app         = _this.app;
        handler.events      = _this.events;
        handler.db          = _this.db;
        handler.init();
    } );
}

WebServer.prototype.handleRoom = function( req, res )
{
    res.sendFile( this.www + "index.html" );
}

WebServer.prototype.handleLogin = function( req, res )
{
    var _this   = this;
    var name    = req.body.name

    if ( name )
    {
        this.db.user.findOne( { name: name }, function( err, user )
        {
            if ( !err && user )
            {
                var opts = { maxAge: 1000 * 60 * 60 * 24 * 30 };

                res.cookie( 'turntableUserAuth', 'auth+live+d8ee07c1a4f1d0cd5fad0e33d4d24ba20cd4ec21', opts );
                res.cookie( 'turntableUserId', user.id, opts );
                res.cookie( 'turntableUserNamed', 'true', opts );

                res.send( "ok " + user.id );
            }
            else if ( err )
            {
                res.send( "error" );
            }
            else
            {
                res.send( "user does not exist" );
            }
        } );
    }
    else
    {
        res.send( "error" );
    }
}

WebServer.prototype.handleRegister = function( req, res )
{
    var _this   = this;
    var name    = req.body.name

    if ( name )
    {
        this.db.user.findOne( { name: name }, function( err, user )
        {
            if ( !err && !user )
            {
                var user    = new _this.db.user( { name: name } );
                user.save( function( err )
                {
                    if ( !err )
                    {
                        res.end( "ok" );
                    }
                    else
                    {
                        res.end( "error registering" );
                    }
                } );
            }
            else if ( err )
            {
                res.end( "error" );
            }
            else
            {
                res.end( "user exists" );
            }
        } );
    }
    else
    {
        res.end( "error" );
    }
}

module.exports = WebServer;
