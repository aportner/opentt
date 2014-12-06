var url             = require( 'url' );

function Search()
{

}

Search.prototype.init = function()
{
    var _this       = this;
    this.providers  = {};
    this.db         = this.tt.modules.db;

    this.config.providers.forEach( function( providerObj )
    {
        var providerClass   = require( './providers/' + providerObj.name + '.js' );
        var provider        = new providerClass();

        provider.config     = providerObj.config;
        provider.db         = _this.db;

        if ( providerObj.default )
        {
            _this.defaultProvider    = provider;
        }

        _this.providers[ providerObj.name ] = provider;

        provider.init();
    } );

    this.app.get( '/previewfile', this.handlePreviewFile.bind( this ) );
};

Search.prototype.search = function( query, page, provider, callback )
{
    provider    = provider ? this.providers[ provider ] : this.defaultProvider;

    if ( provider )
    {
        provider.search( query, page, callback );
    }
};

Search.prototype.handlePreviewFile = function( req, res )
{
    var url_parts	= url.parse(req.url, true);
    var query		= url_parts.query;
    var fileId		= query.fileid;

    if ( fileId )
    {
        this.db.song.findOne({ _id: fileId } )
        .exec( function( err, song ) {
            if ( !err && song )
            {
                res.status(302);
                res.setHeader( 'Location', 'http://api.soundcloud.com/tracks/' + song.mnid.substr( 3 ) + '/stream?consumer_key=nH8p0jYOkoVEZgJukRlG6w' );
                res.end('ok');
            }
            else
            {
                if ( err )
                {
                    console.error( 'error loading song:', err );
                }

                res.status(404);
                res.end('song not found');
            }
        })
    }
};


module.exports = Search;
