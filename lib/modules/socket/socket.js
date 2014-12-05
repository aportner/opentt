var SocketHandler   = require( './handler.js' );

function Socket()
{

}

Socket.prototype.init = function()
{
    this.db         = this.tt.modules.db;
    this.io.sockets.on( 'connection', this.handleConnection.bind( this ) );
}

Socket.prototype.handleConnection = function( socket )
{
    var handler     = new SocketHandler( socket );
    handler.tt      = this.tt;
    handler.db      = this.db;
    handler.io      = this.io;
}

module.exports = Socket;
