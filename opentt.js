var CONFIG_FILE     = './config.json';
var LIB_DIR         = './lib';
var MODULES_DIR     = LIB_DIR + '/modules';

var express         = require( 'express' );
var http            = require( 'http' );
var io              = require( 'socket.io' );
var os              = require( 'os' );
var cookieParser    = require( 'cookie-parser' );

var config      = require( CONFIG_FILE );

function OpenTT( config )
{
    this.config = config;

    this.init();
}

OpenTT.prototype.init = function()
{
    this.initServer();
    this.initModules();
}

OpenTT.prototype.initServer = function()
{
    this.app        = express();
    this.server     = http.Server( this.app );
    this.io         = io( this.server );

    this.app.use( cookieParser() );

    this.server.listen( this.config.port );
}

OpenTT.prototype.initModules = function()
{
    var _this       = this;
    this.modules    = [];

    this.config.modules.forEach( function( moduleObj )
    {
        var moduleClass = require( MODULES_DIR + '/' + moduleObj.name );
        var module      = new moduleClass();

        module.tt       = _this;
        module.app      = _this.app;
        module.server   = _this.server;
        module.io       = _this.io;
        module.db       = _this.db;
        module.config   = moduleObj.config;
        module.init();

        _this.modules.push( module );
    } );
}

var tt          = new OpenTT( config );
