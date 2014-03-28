var gamefile = require('./public/game');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

// NYI db stuff
// var mongoose = require('mongoose');
// var dbConnection = mongoose.createConnection('localhost', 'cardsdb');

var socket = server.listen(3001);
app.set("log level", 1);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('view options', { layout: false });
app.configure(function() {
  app.use(express.static(__dirname + '/public'));
});
// io.set('heartbeat timeout', 4);
// io.set('heartbeat interval', 2);

// Routing
app.get('/', function(req, res) {
  res.render('index');
});
app.get('/table/:id', function(req, res) {
  res.render('table');
});

var game = new gamefile.Game();
var deck = game.deck;
var crib = new gamefile.Hand();
var flipCard = null;
var players = {};

io.sockets.on('connection', function(client) {
  client.on('dealCards', function() {
    client.emit('updateCrib', crib);
    if (players[client.id].hand.cards.length !== 0) {
      return false;
    }
    var cards = game.draw(deck, 6, "", true);
    players[client.id].hand.cards = cards;
    client.emit('showCards', cards);
    io.sockets.emit("remainingCards", deck.length);
  });

  client.on('addPlayer', function(playerName) {
    var player = new gamefile.Player(playerName);
    players[client.id] = player;
    console.log("Players: ");
    for (var p in players) {
      console.log(p['playerName'] + " "); 
    }
  });

  client.on('sendToCrib', function(cardIndex) {
    if(players[client.id].hand.cards.length > 4) {
      crib.cards.push(players[client.id].hand.cards.splice(cardIndex, 1)[0]);
      client.emit('showCards', players[client.id].hand.cards);
      io.sockets.emit('updateCrib', crib);
    }
    if(crib.cards.length === 4) {
      flipCard = deck.pop();
      io.sockets.emit('showFlipCard', flipCard);
      io.sockets.emit('remainingCards', deck.length);

      // Later, this will go at a different point...
      var scores = {};
      var scoresBreakdown = {};
      var playerKeys = Object.keys(players);
      console.log(playerKeys);
      for (var i = 0; i < playerKeys.length; i++) {
        players[playerKeys[i]].hand.cards.push(flipCard);
        var player = players[playerKeys[i]];
        scores[player.playerName] = player.hand.totalScore();

        scoresBreakdown[player.playerName] = {};
        scoresBreakdown[player.playerName]['cards'] = player.hand.cards;
        scoresBreakdown[player.playerName]['nobScore'] = player.hand.nobScore();
        scoresBreakdown[player.playerName]['flushScore'] = player.hand.flushScore();
        scoresBreakdown[player.playerName]['pairScore'] = player.hand.pairScore();
        scoresBreakdown[player.playerName]['fifteenScore'] = player.hand.fifteenScore();
        scoresBreakdown[player.playerName]['runScore'] = player.hand.runScore();
      }
      io.sockets.emit('showCrib', crib.cards);
      crib.cards.push(flipCard);
      scores['crib'] = crib.totalScore();
      scoresBreakdown['crib'] = {};
      scoresBreakdown['crib']['cards'] = crib.cards;
      scoresBreakdown['crib']['nobScore'] = crib.nobScore();
      scoresBreakdown['crib']['flushScore'] = crib.flushScore();
      scoresBreakdown['crib']['pairScore'] = crib.pairScore();
      scoresBreakdown['crib']['fifteenScore'] = crib.fifteenScore();
      scoresBreakdown['crib']['runScore'] = crib.runScore();

      io.sockets.emit('showScores', scores);
      io.sockets.emit('showScoresBreakdown', scoresBreakdown);
    }
  });

  // Why doesn't this ever fire??
  client.on('disonnect', function() {
    console.log("Player with id: " + client.id + " has disconnected.");
    delete players[client.id];
  });
});