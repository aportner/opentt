function SocketHandler( socket )
{
    this.socket = socket;
    this.socket.on( 'message', this.handleMessage.bind( this ) );
}

SocketHandler.prototype.send = function( data )
{
    this.socket.send( JSON.stringify( data ) );
}

SocketHandler.prototype.handleMessage = function( data )
{
    var _this   = this;
    data        = JSON.parse( data );

    // console.log( data );
    if ( data.api == 'presence.update' )
    {
        this.handlePresenceUpdate( data );
    }
    else if ( data.api == 'user.modify' )
    {
        data.success = true;
        this.send( data );
    }
    else if ( data.api == 'room.register' )
    {
        this.handleRoomRegister( data );
    }
    else if ( data.api == 'room.info' )
    {
        this.handleRoomInfo( data );
    }
    else if ( data.api == 'room.speak' )
    {
        this.handleRoomSpeak( data );
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

SocketHandler.prototype.handleRoomRegister = function( data )
{
    var _this       = this;

    if ( data.roomid && data.userid )
    {
        this.db.user.findOne( { _id: data.userid } )
        .populate( "playlists" )
        .populate( "activePlaylist" )
        .exec( function( err, user ) {
            if ( !err && user )
            {
                _this.user   = user;

                _this.tt.modules.room.join( data.roomid, _this, function( room )
                {
                    if ( room )
                    {
                        _this.room  = room;
                        room.on( 'join', _this.roomOnJoin.bind( _this ) );
                        room.on( 'speak', _this.roomOnSpeak.bind( _this ) );

                        var json = {
                            "api": data.api,
                            "success": true,
                            "msgid": data.msgid,
                            "roomid": data.roomid
                        }

                        _this.send( json );
                    }
                } );
            }
        })
    }
};

SocketHandler.prototype.roomOnJoin = function( handler )
{
    var json =
    {
        "command": "registered",
        "success": "true",
        "user": [ handler.user.toJSON(),
        ],
    }

    this.send( json );
}

SocketHandler.prototype.handleRoomInfo = function( data )
{
    var json;

    if ( this.room )
    {
        json =
        {
            api: "room.info",
            success: true,
            msgid: data.msgid,
            roomid: data.roomid,
            room: this.room.toJSON(),
            users: this.room.getUsers(),
            djids: this.room.djs,
            listenerids: this.room.getListeners()
        }

        // console.log( 'room info:', json, '\n');
        this.send( json );
    }
    else
    {
        json =
        {
            api: "room.info",
            success: false,
            msgid: data.msgid,
            roomid: data.roomid
        }

        this.send( json );
    }
}

SocketHandler.prototype.handleRoomSpeak = function( data )
{
    this.room.speak( this, data.text );
}

SocketHandler.prototype.roomOnSpeak = function( handler, text )
{
    var json = {
        "command": "speak",
        "userid": handler.user.id,
        "name": handler.user.name,
        "text": text
    }

    this.send( json );
}

module.exports = SocketHandler;
