var SocketHandler   = require( './handler.js' );

function Socket()
{

}

Socket.prototype.init = function()
{
    this.io.sockets.on( 'connection', this.handleConnection.bind( this ) );
}

Socket.prototype.handleConnection = function( socket )
{
    new SocketHandler( socket );
}

module.exports = Socket;
