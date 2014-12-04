var mongoose    = require( 'mongoose' );

var Avatar        = mongoose.Schema( {
    avatarid: String,
    frontSize: Array,
    images: {
        bb: String,
        bf: String,
        fb: String,
        ff: String,
        hb: String,
        hf: String
    },
    ll: Number,
    name: String,
    size: Array,
    sprites: {},
    states: {
        back: [
            {
                name: String,
                offset: Array
            }
        ],
        front: [
            {
                name: String,
                offset: Array
            }
        ]
    }
} );

module.exports  = Avatar;
