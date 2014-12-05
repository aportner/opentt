var path            = require( 'path' );
var url             = require( 'url' );

function BlockHandler()
{
    this.api        = [
        { name: 'list_all', callback: this.handleListAll }
    ];
}

BlockHandler.prototype.init = function()
{
};

BlockHandler.prototype.handleListAll = function( req, res, callback )
{
    callback( true, { blocks: [] } );
};

module.exports = BlockHandler;
