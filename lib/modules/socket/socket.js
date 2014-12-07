var SocketHandler   = require( './handler.js' );

function Socket()
{

}

Socket.prototype.init = function()
{
    this.db         = this.tt.modules.db;
    this.handlers   = [];
    this.io.sockets.on( 'connection', this.handleConnection.bind( this ) );
}

Socket.prototype.handleConnection = function( socket )
{
    var _this       = this;

    var handler     = new SocketHandler( socket );
    handler.tt      = this.tt;
    handler.db      = this.db;
    handler.io      = this.io;
    this.handlers.push( handler );

    socket.once( 'disconnect', function() { _this.handleDisconnect( handler ); } );
}

Socket.prototype.handleDisconnect = function( handler )
{
    var index       = this.handlers.indexOf( handler );

    if ( index != -1 )
    {
        this.handlers.splice( index, 1 );
    }
}

Socket.prototype.getHandlerByUserId = function( id )
{
    var len         = this.handlers.length;

    for ( var i = 0; i < len; ++i )
    {
        var handler = this.handlers[ i ];

        if ( handler && handler.user && handler.user.id == id )
        {
            return handler;
        }
    }

    return null;
}

module.exports = Socket;
