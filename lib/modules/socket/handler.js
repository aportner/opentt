function SocketHandler( socket )
{
    console.log( 'New Socket' );

    this.socket = socket;

    this.socket.on( 'message', this.handleMessage.bind( this ) );
}

SocketHandler.prototype.send = function( data )
{
    this.socket.send( 'message', data );
}

SocketHandler.prototype.handleMessage = function( data )
{
    data    = JSON.parse( data );

    // console.log( data );
    if ( data.api == 'presence.update' )
    {
        this.handlePresenceUpdate( data );
    }
    else
    {
        console.log( 'unknown packet:', data );
        console.log( '' );
    }
}

SocketHandler.prototype.handlePresenceUpdate = function( data )
{
    data.success 	= true;
    data.now 		= Date.now() / 1e3;

    this.send( data );
}

module.exports = SocketHandler;
