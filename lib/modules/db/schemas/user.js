var mongoose    = require( 'mongoose' );

var Playlist    = mongoose.Schema( {
    name:           { type: String, required: true },
    userid:         { type: mongoose.Schema.Types.ObjectId, ref: 'user', index: true, required: true },
    songs:          [{ type: mongoose.Schema.Types.ObjectId, ref: 'song' }]
} );

Playlist.methods.getMetadata = function()
{
    var metadata = {};

    this.songs.forEach( function( song )
    {
        metadata[ song.id ] 	= song.toJSON();
    });

    return metadata;
};

var User        = mongoose.Schema({
    name: { type: String, required: true },
    acl: { type: Number, default: 1 },
    status: { type: String, default: "online" },
    created: { type: Date, default: Date.now },
    laptop: { type: String, default: "pc" },
    fans: { type: Array, default: [] },
    points: { type: Number, default: 0 },
    avatarid: { type: String, default: 1 },
    fanOf: { type: Array, default: [] },
    playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'playlist' }],
    activePlaylist: { type: mongoose.Schema.Types.ObjectId, ref: 'playlist' }
});

User.methods.toJSON = function()
{
    return {
        id: 			this.id,
        cid: 			this.id,
        _id: 			this.id,
        userid: 		this.id,
        name: 			this.name,
        acl: 			this.acl,
        status: 		this.status,
        presence: 		this.status,
        created: 		this.created.getTime() * 0.001,
        laptop: 		this.laptop,
        fans: 			this.fans.length,
        points: 		this.points,
        avatarid: 		this.avatarid,
        userauth: 		"11",
        auth: 			"100",
        registered: 	true,
        verified: 		true,
        subscription_level: 1,
        images:
        {
            headfront: '/avatars/' + this.avatarid + '_HeadFront.png'
        }
    }
}

User.methods.getPlaylistById = function( id )
{
    var len         = this.playlists.length;

    for ( var i = 0; i < len; ++i )
    {
        var playlist    = this.playlists[ i ];

        if ( playlist && playlist._id.equals( id ) )
        {
            return playlist;
        }
    }

    return null;
}

User.methods.getPlaylistByName = function( name )
{
    var len         = this.playlists.length;

    for ( var i = 0; i < len; ++i )
    {
        var playlist    = this.playlists[ i ];

        if ( playlist && playlist.name == name )
        {
            return playlist;
        }
    }

    return null;
}

User.methods.getActivePlaylist = function()
{
    return this.getPlaylistById( this.activePlaylist );
}

module.exports  = User;
