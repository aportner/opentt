var mongoose    = require( 'mongoose' );

var User        = mongoose.Schema({
    name: { type: String, required: true },
    acl: { type: Number, default: 1 },
    status: { type: String, default: "online" },
    created: { type: Date, default: Date.now },
    laptop: { type: String, default: "pc" },
    fans: { type: Array, default: [] },
    points: { type: Number, default: 0 },
    avatarid: { type: Number, default: 1 },
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
            headfront: 'https://s3.amazonaws.com/static.turntable.fm/roommanager_assets/avatars/' + this.avatarId + '/scaled/55/headfront.png'
        }
    }
}

module.exports  = User;
