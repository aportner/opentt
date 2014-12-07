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
    this.app.use( '/', express.static( this.www ) );
    this.app.use( '/static', express.static( this.www + this.config.paths.static ) );
    this.app.use( '/roommanager_assets', express.static( this.www + this.config.paths.roomManagerAssets ) );
    this.app.use( '/avatars', express.static( this.config.paths.avatars ) );
    this.app.use( '/assets/images', express.static( this.config.paths.imageAssets ) );
    this.app.use( '/assets/images/playlist', express.static( this.config.paths.imageAssets ) );
    this.app.use( '/images/playlist', express.static( this.config.paths.imageAssets ) );
    this.app.use( '/images/sprites', express.static( this.config.paths.imageAssets ) );
    this.app.use( '/images/room', express.static( this.config.paths.imageAssets ) );
    this.app.use( '/images/tour', express.static( this.config.paths.imageAssets ) );
    this.app.use( '/images/search', express.static( this.config.paths.imageAssets ) );
    this.app.use( '/images/pm', express.static( this.config.paths.imageAssets ) );
    this.app.use( '/images/black-msg', express.static( this.config.paths.imageAssets ) );
    this.app.use( '/assets/images/chatstickers', express.static( this.config.paths.imageAssets + '/room-captures/the_verge_files' ) );

    this.app.post( '/login', this.handleLogin.bind( this ) );
    this.app.post( '/register', this.handleRegister.bind( this ) );
    this.app.post( '/addRoom', this.handleAddRoom.bind( this ) );

    this.initHandlers();
}

WebServer.prototype.initHandlers = function()
{
    var _this       = this;
    var handlers    = [ 'user', 'avatar', 'room', 'playlist', 'block', 'sticker', 'headband' ];

    handlers.forEach( function( name )
    {
        var handlerClass    = require( './handlers/' + name + '.js' );
        var handler         = new handlerClass();

        handler.app         = _this.app;
        handler.events      = _this.events;
        handler.db          = _this.db;

        _this.mapHandler( name, handler );
        handler.init();
    } );
};

WebServer.prototype.mapHandler = function( name, handler )
{
    var _this       = this;

    handler.api.forEach( function( apiObject )
    {
        var method      = apiObject.name;
        var type        = apiObject.type ? apiObject.type : 'get';
        var callback    = apiObject.callback;

        _this.bindHandler( name, handler, method, type, callback );
    } );
};

WebServer.prototype.bindHandler = function( name, handler, method, type, callback )
{
    var _this       = this;

    this.app[ type ]( '/api/' + name + '.' + method, function( req, res )
    {
        callback.call( handler, req, res, function( success, json )
        {
            res.setHeader('Content-Type', 'application/json');
            var response    = [ success, json ];
            res.end( JSON.stringify( response ) );
        } );
    } );
};

WebServer.prototype.handleRoom = function( req, res )
{
    res.sendFile( this.www + "room.html" );
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
                res.cookie( 'turntableShowBigWelcome', 'true', opts );

                res.end( "[ true, \"" + user.id + "\" ]" );
            }
            else if ( err )
            {
                console.error( 'error logging in:', err );
                res.end( "[ false, null ]" );
            }
            else
            {
                res.end( "[ false, null ]" );
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
                        var opts = { maxAge: 1000 * 60 * 60 * 24 * 30 };

                        res.cookie( 'turntableUserAuth', 'auth+live+d8ee07c1a4f1d0cd5fad0e33d4d24ba20cd4ec21', opts );
                        res.cookie( 'turntableUserId', user.id, opts );
                        res.cookie( 'turntableUserNamed', 'true', opts );
                        res.cookie( 'turntableShowBigWelcome', 'true', opts );
                        
                        res.end( "[ true, \"" + user.id + "\" ]" );
                    }
                    else
                    {
                        res.end( "[ false, null ]" );
                        console.error( 'error registering: ' + err );
                    }
                } );
            }
            else if ( err )
            {
                res.end( "[ false, null ]" );
                console.error( 'error registering: ' + err );
            }
            else
            {
                res.end( "[ false, null ]" );
            }
        } );
    }
    else
    {
        res.end( "error" );
    }
}

WebServer.prototype.handleAddRoom = function( req, res )
{
    var _this       = this;
    var name        = req.body.name;
    var shortcut    = req.body.shortcut;
    var userid      = req.cookies.turntableUserId;

    if ( name && shortcut && userid )
    {
        this.db.room.findOne( { shortcut: shortcut }, function( err, room )
        {
            if ( !err && !room )
            {
                var room    = new _this.db.room(
                {
                    name:       name,
                    shortcut:   shortcut,
                    userid:     userid
                } );

                room.save( function( err )
                {
                    if ( !err )
                    {
                        res.end( "ok" );
                    }
                    else
                    {
                        res.end( "error registering" );
                        console.error( 'error registering: ' + err );
                    }
                } );
            }
            else if ( err )
            {
                res.end( "error" );
                console.error( 'error registering: ' + err );
            }
            else
            {
                res.end( "room exists" );
            }
        } );
    }
    else
    {
        res.end( "error" );
    }
}

module.exports = WebServer;
