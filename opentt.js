var CONFIG_FILE     = './config.json';
var LIB_DIR         = './lib';
var MODULES_DIR     = LIB_DIR + '/modules';

var express         = require( 'express' );
var http            = require( 'http' );
var io              = require( 'socket.io' );
var os              = require( 'os' );
var cookieParser    = require( 'cookie-parser' );
var bodyParser      = require( 'body-parser' );
var events          = require( 'events' );

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
    this.app.use( bodyParser.urlencoded( { extended: false } ) );
    this.app.use( bodyParser.json() );

    this.server.listen( this.config.port );
}

OpenTT.prototype.initModules = function()
{
    var _this       = this;
    this.modules    = {};
    this.events     = new events.EventEmitter();

    this.config.modules.forEach( function( moduleObj )
    {
        var moduleName  = moduleObj.name
        var moduleClass = require( MODULES_DIR + '/' + moduleName );
        var module      = new moduleClass();

        module.tt       = _this;
        module.app      = _this.app;
        module.server   = _this.server;
        module.io       = _this.io;
        module.events   = _this.events;
        module.config   = moduleObj.config;

        _this.modules[ moduleName ] = module;
    } );

    for ( moduleName in this.modules )
    {
        module          = this.modules[ moduleName ];
        module.init();
    }
}

var tt          = new OpenTT( config );
