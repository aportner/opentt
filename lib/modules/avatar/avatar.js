var mongoose        = require( 'mongoose' );
var path            = require( 'path' );
var fs              = require( 'fs' );
var PNG             = require( "./png-node.js" );

function Avatar()
{
}

Avatar.prototype.init = function()
{
    this.dir        = path.dirname( require.main.filename ) + path.sep + this.config.path;
    this.files      = [
        'headfront.png',
        'headback.png',
        'bodyfront.png',
        'bodyback.png',
        'fullfront.png',
        'fullback.png'
    ]

    this.events.on( 'db', this.handleDb.bind( this ) );
}

Avatar.prototype.handleDb = function()
{
    var _this       = this;
    this.db         = this.tt.modules.db;

    this.db.avatar.find( {}, function( err, avatars )
    {
        if ( !err && avatars.length == 0 )
        {
            console.log( 'Avatars do not exist, parsing.' );
            _this.parseAvatars();
        }
        else if ( err )
        {
            console.log( 'error loading avatars: ' + err );
        }
        else
        {
            console.log( 'Avatars already exist' );
            _this.events.emit( 'avatars' );
        }
    } );
}

Avatar.prototype.parseAvatars = function()
{
    var _this       = this;
    this.ids        = [];
    this.count      = 0;

    fs.readdir( this.dir, function( err, files ) {
        if ( !err && files )
        {
            files.forEach( function( file )
            {
                var fileObj = file.split( '_' );

                if ( fileObj.length > 1 && fileObj[ 1 ].toLowerCase() == _this.files[ 0 ] )
                {
                    _this.ids.push( fileObj[ 0 ] );
                }
            });

            _this.nextId();
        }
    } );
}

Avatar.prototype.nextId = function()
{
    if ( this.ids.length > 0 )
    {
        this.id     = this.ids.shift();
        this.pngs   = [];
        this.pixels = [];

        this.nextPNG();
    }
    else
    {
        console.log( 'Done parsing ' + this.count + ' avatars' );
        this.events.emit( 'avatars' );
    }
}

Avatar.prototype.nextPNG = function()
{
    var _this       = this;

    if ( this.pngs.length == this.files.length )
    {
        this.donePNG();
    }
    else
    {
        var file        = this.files[ this.pngs.length ];
        var filePath    = this.dir + path.sep + this.id + "_" + file;

        fs.readFile( filePath, function( err, data ) {
            var png;

            try
            {
                png = new PNG( data );
            }
            catch ( err )
            {
                console.log("couldnt open " + filePath );
                console.log( err );
                _this.nextId();
            }

            if ( png )
            {
                png.decode( function( pixels )
                {
                    _this.pngs.push( png );

                    if ( pixels )
                    {
                        _this.pixels.push( pixels );
                    }

                    _this.nextPNG();
                } );
            }
        });
    }
}

Avatar.prototype.donePNG = function()
{
    var _this       = this;
    var headFront   = this.pngs[ 0 ];
    var headBack    = this.pngs[ 1 ];
    var bodyFront   = this.pngs[ 2 ];
    var bodyBack    = this.pngs[ 3 ];
    var fullFront   = this.pngs[ 4 ];
    var fullBack    = this.pngs[ 5 ];
    var isParsed    = this.pixels.length == this.pngs.length;

    var hfs         = isParsed ? whiteSpaceBottom( headFront, this.pixels[ 0 ] ) : 0;
    var hbs         = isParsed ? whiteSpaceBottom( headBack, this.pixels[ 1 ] ) : 0;
    var bfs         = isParsed ? whiteSpaceTop( bodyFront, this.pixels[ 2 ] ) : 0;
    var bbs         = isParsed ? whiteSpaceTop( bodyBack, this.pixels[ 3 ] ) : 0;

    var avatar = {
        avatarid: this.id,
        frontSize: [ fullFront.width, fullFront.height ],
        images: {
            bb: this.config.path + "/" + this.id + "_" + "bodyback.png",
            bf: this.config.path + "/" + this.id + "_" + "bodyfront.png",
            fb: this.config.path + "/" + this.id + "_" + "fullback.png",
            ff: this.config.path + "/" + this.id + "_" + "fullfront.png",
            hb: this.config.path + "/" + this.id + "_" + "headback.png",
            hf: this.config.path + "/" + this.id + "_" + "headfront.png"
        },
        ll: 101,
        name: this.id,
        size: [ fullBack.width, fullBack.height ],
        sprites: {
        },
        states: {
            back: [{
                name: "hb",
                offset: [ parseInt( fullBack.width / 2 - headBack.width / 2, 10 ), 0]
            }, {
                name: "bb",
                offset: [ parseInt( fullBack.width / 2 - bodyBack.width / 2, 10 ), headBack.height - hbs - bbs - 5 ]
            }],
            front: [{
                name: "bf",
                offset: [ parseInt( fullFront.width / 2 - bodyFront.width / 2, 10 ), headFront.height - hfs - bfs - 5 ]
            }, {
                name: "hf",
                offset: [ parseInt( fullFront.width / 2 - headFront.width / 2, 10 ), 0]
            }]
        }
    }

    var obj = new this.db.avatar( avatar );
    obj.save( function( err ) {
        if ( !err )
        {
            console.log( 'Parsed avatar ' + _this.id );
            ++_this.count;
            _this.nextId();
        }
        else
        {
            console.error( err );
        }
    });
}

function whiteSpaceTop( png, pixels )
{
    for ( var y = 0; y < png.height; ++y )
    {
        for ( var x = 0; x < png.width; ++x)
        {
            var idx     = ( png.width * y + x ) << 2;
            var alpha   = pixels[ idx + 3 ];

            if ( alpha > 0 )
            {
                return y;
            }
        }
    }

    return y;
}

function whiteSpaceBottom( png, pixels )
{
    for ( var y = 0; y < png.height; ++y )
    {
        for ( var x = 0; x < png.width; ++x)
        {
            var idx     = ( png.width * ( png.height - y - 1 ) + x ) << 2;
            var alpha   = pixels[ idx + 3 ];

            if ( alpha > 0 )
            {
                return y;
            }
        }
    }

    return y;
}

module.exports = Avatar;
