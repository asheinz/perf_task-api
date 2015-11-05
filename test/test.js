var assert = require( 'assert' );
var should = require( 'should' );

var players = require ( '../routes/players' );

describe( 'players', function() {
	describe( '__testOnly._buildMatches', function() {
		it('should take two match rows with similar ids and create a match object', function() {
			var input = [
				{
					game_id: 1,
					time_played: "Sat Mar 08 2014 14:31:13 GMT-0500 (EST)",
					user_id: 1,
					name: 'Sam',
					points_scored: 21,
					location: 'Batcave'
				},
				{
					game_id: 1,
					time_played: "Sat Mar 08 2014 14:31:13 GMT-0500 (EST)",
					user_id: 3,
					name: 'Mike',
					points_scored: 19,
					location: 'Batcave'
				}
			];

			var output = [{
				gameId: 1,
				players: [ 1, 3 ],
				playerNames: [ 'Sam', 'Mike' ],
				playerScores: [ 21, 19 ],
				datePlayed: "Sat Mar 08 2014 14:31:13 GMT-0500 (EST)",
				location: 'Batcave'
			}];

			JSON.stringify( players.__testOnly._buildMatches( input ) ).should.equal( JSON.stringify( output ) );
		} );
	} );

	describe( '__testOnly._determineMatchOutcomes', function() {
		it( 'should assign win, lose, tie, win with invalid, lose with invalid, tie with invalid', function() {
			var input = [
				{
					gameId: 1, players: [ 1, 3 ], playerNames: [ 'Sam', 'Mike' ], playerScores: [ 21, 19 ], datePlayed: "Sat Mar 08 2014 14:31:13 GMT-0500 (EST)", location: 'Batcave'
				},
				{
					gameId: 2, players: [ 1, 3 ], playerNames: [ 'Sam', 'Mike' ], playerScores: [ 19, 21 ], datePlayed: "Sat Mar 09 2014 14:31:13 GMT-0500 (EST)", location: 'Batcave'
				},
				{
					gameId: 3, players: [ 1, 3 ], playerNames: [ 'Sam', 'Mike' ], playerScores: [ 21, 21 ], datePlayed: "Sat Mar 10 2014 14:31:13 GMT-0500 (EST)", location: 'Batcave'
				},
				{
					gameId: 4, players: [ 1, 3 ], playerNames: [ 'Sam', 'Mike' ], playerScores: [ 19, 18 ], datePlayed: "Sat Mar 11 2014 14:31:13 GMT-0500 (EST)", location: 'Batcave'
				},
				{
					gameId: 5, players: [ 1, 2, 3, 4 ], playerNames: [ 'Sam', 'James', 'Mike', 'Jon' ], playerScores: [ 19, 19, 21, 17 ], datePlayed: "Sat Mar 12 2014 14:31:13 GMT-0500 (EST)", location: 'Batcave'
				},
				{
					gameId: 6, players: [ 1, 1 ], playerNames: [ 'Sam', 'Sam' ], playerScores: [ 21, 21 ], datePlayed: "Sat Mar 13 2014 14:31:13 GMT-0500 (EST)", location: 'Batcave'
				}
			];

			var output = [
				{
					gameId: 1, players: [ 1, 3 ], playerNames: [ 'Sam', 'Mike' ], playerScores: [ 21, 19 ], datePlayed: "Sat Mar 08 2014 14:31:13 GMT-0500 (EST)", location: 'Batcave', outcome: "win"
				},
				{
					gameId: 2, players: [ 1, 3 ], playerNames: [ 'Sam', 'Mike' ], playerScores: [ 19, 21 ], datePlayed: "Sat Mar 09 2014 14:31:13 GMT-0500 (EST)", location: 'Batcave', outcome: "loss"
				},
				{
					gameId: 3, players: [ 1, 3 ], playerNames: [ 'Sam', 'Mike' ], playerScores: [ 21, 21 ], datePlayed: "Sat Mar 10 2014 14:31:13 GMT-0500 (EST)", location: 'Batcave', outcome: "tie"
				},
				{
					gameId: 4, players: [ 1, 3 ], playerNames: [ 'Sam', 'Mike' ], playerScores: [ 19, 18 ], datePlayed: "Sat Mar 11 2014 14:31:13 GMT-0500 (EST)", location: 'Batcave', outcome: "win", invalid: true
				},
				{
					gameId: 5, players: [ 1, 2, 3, 4 ], playerNames: [ 'Sam', 'James', 'Mike', 'Jon' ], playerScores: [ 19, 19, 21, 17 ], datePlayed: "Sat Mar 12 2014 14:31:13 GMT-0500 (EST)", location: 'Batcave', outcome: "loss", invalid: true
				},
				{
					gameId: 6, players: [ 1, 1 ], playerNames: [ 'Sam', 'Sam' ], playerScores: [ 21, 21 ], datePlayed: "Sat Mar 13 2014 14:31:13 GMT-0500 (EST)", location: 'Batcave', outcome: "tie", invalid: true
				}
			];

			players.__testOnly._determineMatchOutcomes( input, 1 );
			JSON.stringify( input ).should.equal( JSON.stringify( output ) );
		} );
	} );

	describe( '__testOnly._filterMatches', function() {
		it ( 'should return only the second match', function() {
			var input = [
				{
					gameId: 1, players: [ 1, 3 ], playerNames: [ 'Sam', 'Mike' ], playerScores: [ 21, 19 ], datePlayed: "Sat Mar 08 2014 14:31:13 GMT-0500 (EST)", location: 'Batcave'
				},
				{
					gameId: 2, players: [ 1, 2 ], playerNames: [ 'Sam', 'James' ], playerScores: [ 19, 21 ], datePlayed: "Sat Mar 09 2014 14:31:13 GMT-0500 (EST)", location: 'Batcave'
				}
			];
			var output = [
				{
					gameId: 2, players: [ 1, 2 ], playerNames: [ 'Sam', 'James' ], playerScores: [ 19, 21 ], datePlayed: "Sat Mar 09 2014 14:31:13 GMT-0500 (EST)", location: 'Batcave'
				}
			];

			players.__testOnly._filterMatches( input, 2 );
			JSON.stringify( input ).should.equal( JSON.stringify( output ) );
		} );
	} );
} );