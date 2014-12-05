var path            = require( 'path' );
var url             = require( 'url' );

function StickerHandler()
{
    this.api        = [
        { name: 'get', callback: this.handleGet }
    ];
}

StickerHandler.prototype.init = function()
{
};

StickerHandler.prototype.handleGet = function( req, res, callback )
{
    callback( true, { stickers: [] } );
};

module.exports = StickerHandler;
