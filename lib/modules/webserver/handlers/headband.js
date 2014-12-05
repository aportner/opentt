var path            = require( 'path' );
var url             = require( 'url' );

function HeadbandHandler()
{
    this.api        = [
        { name: 'get_headbands', callback: this.handleGetHeadbands }
    ];
}

HeadbandHandler.prototype.init = function()
{
}

HeadbandHandler.prototype.handleGetHeadbands = function( req, res, callback )
{
    callback( true, { "headbands": [] } );
};

module.exports = HeadbandHandler;
