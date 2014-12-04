function SocketHandler( socket )
{
    this.socket = socket;

    this.socket.on( 'message', this.handleMessage.bind( this ) );
}

SocketHandler.prototype.handleMessage = function( data )
{
    console.log( data );
}

module.exports = SocketHandler;
