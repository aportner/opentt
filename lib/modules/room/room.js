var EventEmitter    = require('events').EventEmitter;
var util            = require( 'util' );

function Room( room )
{
    this.room       = room;
    this.users      = [];
    this.listeners  = [];
    this.songLog    = [];
    this.voteLog    = [];
    this.current_dj = null;
    this.djs        = [];
    this.upvotes    = 0;
    this.downvotes  = 0;
}

util.inherits( Room, EventEmitter );

Room.prototype.init = function()
{
    this.events.on( 'avatar', this.onAvatar.bind( this ) );
}

Room.prototype.join = function( handler, callback )
{
    this.emit( 'join', handler );

    this.users.push( handler );
    this.listeners.push( handler );

    callback( this );
}

Room.prototype.getUsers = function()
{
    var users   = [];

    this.users.forEach( function( handler )
    {
        users.push( handler.user.toJSON() );
    } );

    return users;
}

Room.prototype.toJSON = function()
{
    var json = {
        name: 					this.room.name,
        roomid: 				this.room.id,
        created: 				this.room.created.getTime() * 0.001,
        shortcut: 				this.room.shortcut,
        name_lower: 			this.room.name.toLowerCase(),
        metadata:
        {
            privacy: 			this.room.privacy,

            songlog: 			this.songLog,
            votelog: 			this.voteLog,

            current_dj: 		this.currentDJ,
            djs: 				this.djs,
            listeners: 			this.getListeners(),

            upvotes: 			this.upvotes,
            downvotes: 			this.downvotes,

            max_djs: 			this.room.maxDJs,

            screens:
            {
                "left": 1,
                "right": 1
            },

            "creator":
            {
                "name": "@Masque",
                "created": 1307587096.74,
                "laptop": "mac",
                "userid": "4df032194fe7d063190425ca",
                "acl": 1,
                "fans": 1125,
                "points": 17336,
                "avatarid": 26
            },
        }
    }

    if ( this.currentSong )
    {
        json.metadata.current_song	= this.currentSong.toJSON();
    }

    return json;
}

Room.prototype.getListeners = function()
{
    var users   = [];

    this.listeners.forEach( function( handler )
    {
        users.push( handler.user.id );
    } );

    return users;
}

Room.prototype.speak = function( handler, text )
{
    this.emit( 'speak', handler, text );
}

Room.prototype.onAvatar = function( id, avatarid )
{
    var handler = this.getHandlerById( id );

    if ( handler != null )
    {
        handler.user.avatarid   = avatarid;
        this.emit( 'avatar', handler, avatarid );
    }
};

Room.prototype.getHandlerById = function( id )
{
    var handler = null;

    this.users.forEach( function( h )
    {
        if ( h.user.id == id )
        {
            handler = h;
        }
    } );

    return handler;
}

module.exports = Room;
