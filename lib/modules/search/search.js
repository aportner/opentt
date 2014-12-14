var url             = require( 'url' );
var async           = require( 'async' );

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
        provider.events     = _this.events;

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
    provider    = provider ? this.providers[ provider ] : null;

    if ( provider )
    {
        provider.search( query, page, callback );
    }
    else
    {
        // merge in results from all providers
        // get all providers
        var providers   = [];
        for ( var key in this.providers )
        {
            providers.push( this.providers[ key ] );
        }

        // search from all providers
        var results     = [];
        async.each( providers, function( provider, cb )
        {
            provider.search( query, page, function( songs )
            {
                results.push( songs );
                cb();
            } );
        }, function( err )
        {
            // merge in results
            var merged  = [];

            while ( results.length )
            {
                for ( var i = 0; i < results.length; ++i )
                {
                    var songs   = results[ i ];
                    if ( songs != null && songs.length > 0 )
                    {
                        merged.push( songs.shift() );
                    }
                    else
                    {
                        results.splice( i--, 1 );
                    }
                }
            }

            callback( merged );
        });
    }
};

Search.prototype.handlePreviewFile = function( req, res )
{
    var _this       = this;
    var url_parts	= url.parse(req.url, true);
    var query		= url_parts.query;
    var fileId		= query.fileid;

    if ( fileId )
    {
        this.db.song.findOne({ _id: fileId } )
        .exec( function( err, song ) {
            if ( !err && song )
            {
                for ( providerName in _this.providers )
                {
                    var provider    = _this.providers[ providerName ];

                    if ( provider.source == song.source )
                    {
                        provider.previewFile( song, req, res );
                    }
                }
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
