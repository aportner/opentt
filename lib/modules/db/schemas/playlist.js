var mongoose    = require( 'mongoose' );

var Playlist    = mongoose.Schema( {
    name:           { type: String, required: true },
    userid:         { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    songs:          [{ type: mongoose.Schema.Types.ObjectId, ref: 'song' }]
} );

module.exports  = Playlist;
