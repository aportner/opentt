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

module.exports  = Playlist;
