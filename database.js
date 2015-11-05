var mysql = require( 'mysql' );
var q = require( 'q' );


var mysqlPool = mysql.createPool({
	connectionLimit : 3,
	host : 'localhost',
	user : 'me',
	password : 'secret',
	database : 'perf_task'
});

// Standard connection call.
mysqlPool.getConnection( function( err, connection ) {
	if ( err ) {
		console.log( err );
		return;
	}

	connection.query( "SELECT 1", function( err, result ) {
		if ( err ) {
			console.log( err );
			return;
		}

		console.log( "Connection to mysql established. Releasing connection." );

		connection.release();
	} );
} );


exports.query = function( query, params ) {
	// Create a deferred so this function acts as a promise-returning function.
	var deferred = q.defer();

	mysqlPool.getConnection( function( err, connection ) {
		if ( err ) {
			// Reject the error.
			return deferred.reject( err );
		}
		// Sanitize the input to prevent sql injection.
		connection.escape( query );
		// Now send the query.
		connection.query( query, params, function( err, result ) {
			// We're done now, release the connection.
			connection.release();
			if ( err ) {
				// Reject the error.
				return deferred.reject( err );
			}
			// Resolve the result.
			return deferred.resolve( result );
		} );
	} );
	// Return the promise.
	/* If it's returned before rejection/resolution, that's fine; the function awaiting this promise will wait when it
	 * finds this promise pending.
	 * If it's returned after rejection/resolution, that's fine; the function awaiting this promise will check for it
	 * immediately.*/
	return deferred.promise;
};