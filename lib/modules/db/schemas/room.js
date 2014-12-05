var mongoose    = require( 'mongoose' );

var Room        = mongoose.Schema( {
    name:           { type: String, required: true },
    shortcut:       { type: String, required: true, index: true },
    userid:         { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    created:        { type: Date, default: Date.now },
    privacy:        { type: String, default: "public" },
    maxDJs:         { type: Number, default: 5 },
    moderatorID:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    maxSize:        { type: Number, default: 200 }
} );

module.exports  = Room;
