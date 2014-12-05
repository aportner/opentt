var Room            = require( './room' );

function RoomModule()
{

}

RoomModule.prototype.init = function()
{
    this.db     = this.tt.modules.db;
    this.rooms  = {};
};

RoomModule.prototype.join = function( id, handler, callback )
{
    var _this   = this;
    var room;

    if ( this.rooms[ id ] == null )
    {
        this.db.room.findOne( { _id: id } )
        .populate( 'userid' )
        .exec( function( err, roomData )
        {
            if ( !err && roomData )
            {
                _this.rooms[ id ] = room = new Room( roomData );
                room.join( handler, callback );
            }
            else
            {
                if ( err )
                {
                    console.err( 'Error loading room:', err );
                    callback( null );
                }
            }
        } );
    }
    else
    {
        this.rooms[ id ].join( handler, callback );
    }
}

module.exports = RoomModule;
