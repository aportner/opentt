var express         = require( 'express' );
var path            = require( 'path' );

function WebServer()
{

}

WebServer.prototype.init = function()
{
    this.dir        = path.dirname( require.main.filename );
    this.www        = this.dir + '/' + this.config.paths.www + '/';

    this.app.get( '/room', this.handleRoom.bind( this ) );
    this.app.use( '/static', express.static( this.www + this.config.paths.static ) );
    this.app.use( '/roommanager_assets', express.static( this.www + this.config.paths.roomManagerAssets ) );
}

WebServer.prototype.handleRoom = function( req, res )
{
    var opts = { maxAge:  1000 * 60 * 60 * 24 * 30 };

    res.cookie( 'turntableUserAuth', 'auth+live+d8ee07c1a4f1d0cd5fad0e33d4d24ba20cd4ec21', opts );
    res.cookie( 'turntableUserId', "123", opts );
    res.cookie( 'turntableUserNamed', 'true', opts );

    res.sendFile( this.www + "index.html");
}

module.exports = WebServer;
