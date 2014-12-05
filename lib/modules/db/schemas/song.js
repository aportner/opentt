var mongoose    = require( 'mongoose' );

var Song        = mongoose.Schema( {
    mnid:           { type: String, required: true, index: { unique: true } },
    title:          { type: String, required: true },
    artist:         { type: String, required: true },
    album:          { type: String },
    length:         { type: Number, required: true },
    coverart:       { type: String },
    source:         { type: String, required: true }
} );

Song.methods.toJSON = function()
{
    return {
        _id: this.id,
        metadata:
        {
            song: this.title,
            artist: this.artist,
            album: this.album,
            length: parseInt( this.length * 0.001, 10 ),
            coverart: this.coverart,
            mnid: this.mnid,
        },
        source: this.source,
    }
}

module.exports  = Song;
