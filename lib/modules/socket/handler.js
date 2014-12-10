function SocketHandler( socket )
{
    this.socket = socket;
    this.socket.on( 'message', this.handleMessage.bind( this ) );
    this.socket.once( 'disconnect', this.handleDisconnect.bind( this ) );
}

SocketHandler.prototype.send = function( data )
{
    this.socket.send( JSON.stringify( data ) );
}

SocketHandler.prototype.handleDisconnect = function()
{
    if ( this.room )
    {
        this.room.removeListener( 'leave', this.roomOnLeaveCallback );
        this.room.removeListener( 'rem_dj', this.roomOnRemDJCallback );
        this.room.removeListener( 'song', this.roomOnSongCallback );
    }

    this.leaveRoom();
}

SocketHandler.prototype.leaveRoom = function()
{
    if ( this.room )
    {
        var room    = this.room;

        this.room.leave( this );
        this.room.removeListener( 'join', this.roomOnJoinCallback );
        this.room.removeListener( 'speak', this.roomOnSpeakCallback );
        this.room.removeListener( 'avatar', this.roomOnAvatarCallback );
        this.room.removeListener( 'leave', this.roomOnLeaveCallback );
        this.room.removeListener( 'add_dj', this.roomOnAddDJCallback );
        this.room.removeListener( 'rem_dj', this.roomOnRemDJCallback );
        this.room.removeListener( 'stop_song', this.roomOnStopSongCallback );
        this.room.removeListener( 'song', this.roomOnSongCallback );
        this.room.removeListener( 'snagged', this.roomOnSnaggedCallback );
        this.room.removeListener( 'vote', this.roomOnVoteCallback );
        this.room.removeListener( 'screens', this.roomOnScreensCallback );
        this.room   = null;
    }
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
    else if ( data.api == 'room.deregister' )
    {
        this.handleRoomDeregister( data );
    }
    else if ( data.api == 'room.info' )
    {
        this.handleRoomInfo( data );
    }
    else if ( data.api == 'room.speak' )
    {
        this.handleRoomSpeak( data );
    }
    else if ( data.api == 'file.search' )
    {
        this.handleFileSearch( data );
    }
    else if ( data.api == 'room.add_dj' )
    {
        this.handleAddDJ( data );
    }
    else if ( data.api == 'room.rem_dj' )
    {
        this.handleRemDJ( data );
    }
    else if ( data.api == 'room.stop_song' )
    {
        this.handleStopSong( data );
    }
    else if ( data.api == 'snag.add' )
    {
        this.handleSnagAdd( data );
    }
    else if ( data.api == 'room.vote' )
    {
        this.handleRoomVote( data );
    }
    else
    {
        console.log( 'unknown packet:', data );
        console.log( '' );
    }
}

SocketHandler.prototype.handleRoomVote = function( data )
{
    var success     = false;

    if ( this.room )
    {
        success     = true;
        this.room.vote( this, data.val );
    }

    data.success    = success;
    this.send( data );
}

SocketHandler.prototype.handleSnagAdd = function( data )
{
    var songId      = data.songid;
    data.success    = true;

    if ( true || !data.in_queue )
    {
        this.room.snag( this, songId );
    }

    this.send( data );
};

SocketHandler.prototype.handleAddDJ = function( data )
{
    var success     = false;

    if ( this.room )
    {
        success     = this.room.addDJ( this );
    }

    data.sucess     = success;
    this.send( data );
}

SocketHandler.prototype.handleRemDJ = function( data )
{
    var success     = false;

    if ( this.room )
    {
        success     = this.room.remDJ( this );
    }

    data.sucess     = success;
    this.send( data );
}

SocketHandler.prototype.handlePresenceUpdate = function( data )
{
    data.success 	= true;
    data.now 		= Date.now() / 1e3;

    this.send( data );
}

SocketHandler.prototype.handleRoomDeregister = function( data )
{
    this.leaveRoom();
}

SocketHandler.prototype.handleRoomRegister = function( data )
{
    var _this       = this;

    if ( data.roomid && data.userid )
    {
        this.db.user.findOne( { _id: data.userid } )
        // .populate( "playlists" )
        // .populate( "activePlaylist" )
        .exec( function( err, user ) {
            if ( !err && user )
            {
                _this.user   = user;

                _this.tt.modules.room.join( data.roomid, _this, function( room )
                {
                    if ( room )
                    {
                        _this.room  = room;

                        _this.roomOnJoinCallback = _this.roomOnJoin.bind( _this );
                        _this.roomOnSpeakCallback = _this.roomOnSpeak.bind( _this );
                        _this.roomOnAvatarCallback = _this.roomOnAvatar.bind( _this );
                        _this.roomOnLeaveCallback = _this.roomOnLeave.bind( _this );
                        _this.roomOnAddDJCallback = _this.roomOnAddDJ.bind( _this );
                        _this.roomOnRemDJCallback = _this.roomOnRemDJ.bind( _this );
                        _this.roomOnSongCallback = _this.roomOnSong.bind( _this );
                        _this.roomOnStopSongCallback = _this.roomOnStopSong.bind( _this );
                        _this.roomOnSnaggedCallback = _this.roomOnSnagged.bind( _this );
                        _this.roomOnVoteCallback = _this.roomOnVote.bind( _this );
                        _this.roomOnScreensCallback = _this.roomOnScreens.bind( _this );

                        room.on( 'join', _this.roomOnJoinCallback );
                        room.on( 'speak', _this.roomOnSpeakCallback );
                        room.on( 'avatar', _this.roomOnAvatarCallback );
                        room.on( 'leave', _this.roomOnLeaveCallback );
                        room.on( 'add_dj', _this.roomOnAddDJCallback );
                        room.on( 'rem_dj', _this.roomOnRemDJCallback );
                        room.on( 'song', _this.roomOnSongCallback );
                        room.on( 'stop_song', _this.roomOnStopSongCallback );
                        room.on( 'snagged', _this.roomOnSnaggedCallback );
                        room.on( 'vote', _this.roomOnVoteCallback );
                        room.on( 'screens', _this.roomOnScreensCallback );

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

SocketHandler.prototype.roomOnLeave = function( handler )
{
    var json =
    {
        "command": "deregistered",
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
            djids: this.room.getDJs(),
            listenerids: this.room.getListeners()
        }

        // console.log( 'room info:', JSON.stringify( json, null, 4 ), '\n');
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

SocketHandler.prototype.handleFileSearch = function( data )
{
    var _this       = this;

    this.tt.modules.search.search( data.query, data.page, null, function( songs )
    {
        json = {
            command: "search_complete",
            query: data.query,
            page: data.page,
            docs: songs ? songs : [],
            success: songs != null
        };

        _this.send( json );
    } );
};

SocketHandler.prototype.roomOnAvatar = function( handler, avatarid )
{
    var json        = handler.user.toJSON();
    json.success    = true;
    json.command    = "update_user";

    this.send( json );
};

SocketHandler.prototype.roomOnAddDJ = function( handler )
{
    var json = {
        command: 'add_dj',
        user:
        [
            handler.user.toJSON()
        ],
        placements: [],
        success: true
    }

    this.send( json );
}

SocketHandler.prototype.roomOnRemDJ = function( handler )
{
    var json = {
        command: 'rem_dj',
        user:
        [
            handler.user.toJSON()
        ],
        placements: [],
        success: true
    }

    this.send( json );
}

SocketHandler.prototype.roomOnSong = function( song )
{
    var json;

    if ( song )
    {
        json = {
            command: "newsong",
            success: true,
            roomid: this.room.room.id,
            room: this.room.toJSON(),
            current_dj_points: this.room.upvotes - this.room.downvotes,
            users: this.room.getUsers(),
            djids: this.room.getDJs(),
            listenerids: this.room.getListeners()
        }
    }
    else
    {
        json = {
            command: "nosong",
            success: true,
            roomid: this.room.room.id,
            room: this.room.toJSON(),
            current_dj_points: 0,
            users: this.room.getUsers(),
            djids: this.room.getDJs(),
            listenerids: this.room.getListeners()
        }
    }

    // console.log( JSON.stringify( json, null, 4 ) );
    this.send( json );
}

SocketHandler.prototype.handleStopSong = function( data )
{
    if ( this.room && this.room.currentDJ == this )
    {
        this.room.stopSong( this );
    }
};

SocketHandler.prototype.roomOnStopSong = function( stopper )
{
    var json = {
        command: "stop_song",
        roomid: this.room.room.id,
        skipperId: stopper.user.id,
        skippedId: this.room.currentDJ.user.id,
        success: true
    }
}

SocketHandler.prototype.roomOnSnagged = function( handler )
{
    var json = {
        success: true,
        command: "snagged",
        userid: handler.user.id
    }

    this.send( json );
}

SocketHandler.prototype.roomOnVote = function()
{
    var json = {
        success: true,
        command: "update_votes",
        room: this.room.toJSON()
    }

    this.send( json );
};

SocketHandler.prototype.roomOnScreens = function( screens )
{
    var json = {
        success: true,
        command: "update_room",
        screens: screens
    }

    this.send( json );
};

module.exports = SocketHandler;
