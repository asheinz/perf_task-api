var express = require( 'express' );

var players = require( './routes/players' );

var app = express();

var setHeaders = function( req, res, next ) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	next();
};

app.use( setHeaders );
app.get( '/players', [players.getPlayers] );
app.get( '/players/:playerId/matches', [players.getPlayerMatches] );
app.get( '/players/:playerId/opponents', [players.getPlayersOpponents] );
app.get( '/players/:playerId/versus/:opponentId', [players.getPlayerMatchesVersus] );
app.use( function( err, req, res, next ) {
	console.error( err.stack );
	res.status(err.status).send(err.message);
});



var server = app.listen(8080, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log( 'Example app listening at http://%s:%s', host, port );
});