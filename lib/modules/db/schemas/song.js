var mongoose    = require( 'mongoose' );

var Song        = mongoose.Schema( {
    mnid:           { type: String, required: true },
    title:          { type: String, required: true },
    artist:         { type: String, required: true },
    album:          { type: String, required: true },
    length:         { type: Number, required: true },
    coverart:       { type: String, required: true },
    source:         { type: String, required: true }
} );

module.exports  = Song;
