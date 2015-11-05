var database = require( '../database' );

var q = require( 'q' );

exports.getPlayers = function( req, res, next ) {
	var query = "SELECT * FROM user";

	database.query( query )
		.then( function( results ) {
			return res.json( results );
		})
		.catch( function( err ) {
			return next( err );
		});
};

exports.getPlayersOpponents = function( req, res, next ) {
	var playerId = parseInt( req.params.playerId );

	var query = [ "",
		"SELECT DISTINCT ",
			"B.id, B.name ",
		"FROM ",
			"perf_task.user_game AS A, ",
			"perf_task.user AS B ",
		"WHERE ",
			"A.game_id IN (",
				"SELECT ",
					"Z.game_id ",
				"FROM ",
					"perf_task.user_game as Z ",
				"WHERE ",
					"Z.user_id = ", playerId,
			") AND ",
			"A.user_id = B.id"
	].join("");

	database.query( query )
		.then( function( results ) {
			return res.json( results );
		})
		.catch( function( err ) {
			return next( err );
		})
};

exports.getPlayerMatches = function( req, res, next ) {

	var playerId = parseInt( req.params.playerId );

	_getPlayerMatches( playerId )
		.then( function( results ) {
			var resultSet = _buildMatches( results );
			_determineMatchOutcomes( resultSet, playerId );

			return res.json( resultSet );
		})
		.catch( function( err ) {
			return next( err );
		});
};

exports.getPlayerMatchesVersus = function( req, res, next ) {
	var playerId = parseInt( req.params.playerId );
	var opponentId = parseInt( req.params.opponentId );

	_getPlayerMatches( playerId, opponentId )
		.then( function( results ) {
			var resultSet = _buildMatches( results, playerId );

			_filterMatches( resultSet, opponentId );
			_determineMatchOutcomes( resultSet, playerId );

			return res.json( resultSet );
		})
		.catch( function( err ) {
			return next( err );
		});
};

var _getPlayerMatches = function( playerId ) {
	var query = [ "",
		"SELECT ",
			"A.game_id, B.time_played, A.user_id, C.name, A.points_scored, B.location ",
		"FROM ",
			"user_game as A, ",
			"game AS B, ",
			"user AS C ",
		"WHERE ",
			"A.game_id IN (",
				"SELECT ",
					"Z.game_id ",
				"FROM ",
					"user_game as Z ",
				"WHERE ",
					"Z.user_id = ", playerId,
			") AND ",
			"B.game_id = A.game_id AND ",
			"C.id = A.user_id"
	].join("");

	return database.query( query )
		.then( function( results ) {
			return results;
		})
};

var _filterMatches = function( resultSet, opponentId ) {
	for ( var i = 0; i < resultSet.length; i++ ) {
		if ( resultSet[i].players.indexOf( opponentId ) < 0 ) {
			resultSet.splice( i, 1 );
			i--;
		}
	}
};

var _buildMatches = function( results ) {
	// This is the result object, a dictionary that stores gameIds as keys, and game information as values.
	var resultObj = {};
	console.log( results );

	// Match object resembles:
	/*  {
	 *      gameId : <Number>,
	 *      players : <Array|Number>,
	 *      scores : <Array|Number>,
	 *      datePlayed : <ISODate>,
	 *      location : <String>
	 *  }
	 * */

	// Loop through the results.
	for ( var i = 0; i < results.length; i++ ) {
		var result = results[i];
		//if ( i === 0 ) console.log( result );
		var gameId = result.game_id;

		var thisGame;

		if ( !resultObj[gameId] ) {
			thisGame = {
				gameId : gameId,
				players : [result.user_id],
				playerNames : [result.name],
				playerScores : [result.points_scored],
				datePlayed : result.time_played,
				location : result.location
			}
		}
		else {
			thisGame = resultObj[gameId];
			thisGame.players.push( result.user_id );
			thisGame.playerNames.push( result.name );
			thisGame.playerScores.push( result.points_scored );
		}

		resultObj[gameId] = thisGame;
	}

	var resultSet = [];

	for ( var match in resultObj ) {
		if ( resultObj.hasOwnProperty( match ) ) {
			resultSet.push( resultObj[match] );
		}
	}

	return resultSet;
};

var _determineMatchOutcomes = function( matches, playerId ) {
	for ( var i = 0; i < matches.length; i++ ) {
		var match = matches[i];
		//if ( i === 0 ) console.log( match );
		// Determine the max score.
		var maxScore = Math.max.apply(null,match.playerScores);
		// Find the index of the max score.
		var maxScoreIndex = match.playerScores.indexOf( maxScore );
		// Since the indexOf method checks from the front of the array for the first instance of maxScore, if it
		// matches the lastIndexOf method that checks from the end of the array for the "last" instance of maxScore,
		// then we know it's the only winning score, i.e. not a tie.
		if ( maxScoreIndex === match.playerScores.lastIndexOf( maxScore ) ) {
			// If the playerId matches the id of the player in the same location as the max score, we have a win,
			// otherwise a loss.
			match.outcome = ( playerId === match.players[maxScoreIndex] ) ? "win" : "loss";
		}
		else {
			// We have a tie.
			match.outcome = "tie";
		}

		// If the match has more than two players or doesn't contain a winning score of 15, 18, 20, or 21, or contains
		// the player more than once, it's invalid.
		if ( 2 < match.players.length || 0 > [ 15, 18, 20, 21].indexOf( maxScore ) || match.players.indexOf( playerId ) !== match.players.lastIndexOf( playerId ) ) {
			match.invalid = true;
		}
	}
};

exports.__testOnly = {
	_buildMatches : _buildMatches,
	_determineMatchOutcomes : _determineMatchOutcomes,
	_filterMatches : _filterMatches
};