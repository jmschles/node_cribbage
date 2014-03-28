// MISC LOGIC

// Generates an array of consecutive integers from 1 to a
var range = function (a) {
    var b = [];
    var i = 1;
    while (i <= a) {
        b.push(i);
        i++;
    }
    return b;
}

// Fisher-Yates shuffle algorithm
function shuffle(array) {
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

// CARD OBJECT

function Card (num) {
  this.index = num;
  this.type = Math.ceil(num / 4);
  this.value = function() {
    if (num > 36) {
      return 10;
    } else {
      return Math.ceil(num / 4);
    }
  }();
  this.suit = function() {
    if (num % 4 == 1) {
      return "C";
    } else if (num % 4 == 2) {
      return "D";
    } else if (num % 4 == 3) {
      return "H";
    } else {
      return "S";
    }
  }();
  this.name = function() {
    var typename = function () {
      if (num > 48) {
        return 'King';
      } else if (num > 44) {
        return 'Queen';
      } else if (num > 40) {
        return 'Jack';
      } else if (num < 5) {
        return 'Ace';
      } else {
        return Math.ceil(num / 4);
      }
    }();
    var suitname = function () {
      switch (num % 4) {
        case 1:
          return "Clubs";
          break;
        case 2:
          return "Diamonds";
          break;
        case 3:
          return "Hearts";
          break;
        default:
          return "Spades";
          break;
      }
    }();
    return typename + " of " + suitname;
  }();
}

// THE GAME OBJECT

function Game() {
  this.deck = this.createDeck();
}

Game.prototype.createDeck = function() {
  var deck = shuffle(range(52));

  for (var i = 0; i < deck.length; i++) {
    deck[i] = new Card(deck[i]);
  }

  return deck;
}

Game.prototype.draw = function(deck, amount, hand, initial) {
  var cards = [];
  cards = deck.slice(0, amount);

  deck.splice(0, amount);

  if (!initial) {
    hand.push.apply(hand, cards);
  }

  return cards;
}

Game.prototype.playCard = function(amount, hand, index) {
  hand.splice(index, amount);
  return hand;
}

// PLAYER OBJECT

function Player(playerName) {
  this.playerName = playerName;
  this.tableID = "";
  this.hand = new Hand();
}

Player.prototype.setName = function(name) {
  this.name = name;
}

// HAND OBJECT

function Hand() {
  this.cards = [];
  this.score = {
    nobScore: 0,
    flushScore: 0,
    pairScore: 0,
    fifteenScore: 0,
    runScore: 0,
    totalScore: 0
  }
}

Hand.prototype.nobScore = function () {
    var score = 0;
    for (var i = 0; i < this.cards.length - 1; i++) {
        if (this.cards[i].type == 11 && this.cards[i].suit == this.cards[4].suit) {
            score += 1;
        }
    }
    return score;
}

Hand.prototype.flushScore = function () {
    var score = 0;
    if (this.cards[0].suit == this.cards[1].suit) {
        if (this.cards[1].suit == this.cards[2].suit) {
            if (this.cards[2].suit == this.cards[3].suit) {
                if (this.cards[3].suit == this.cards[4].suit) {
                    score += 5;
                } else {
                    score += 4;
                }
            }
        }
    }
    return score;
}

Hand.prototype.pairScore = function () {
    var cards = this.cards.sort(function(a,b){return a.index-b.index});
    var score = 0; 
    // Pairs
    for (var i = 0; i < cards.length - 1; i++) {
        if (cards[i].type == cards[i+1].type) {
            score += 2;
        }
    }
    // 3 of a kind?
    for (var i = 0; i < cards.length - 2; i++) {
        if (cards[i].type == cards[i+2].type) {
            score += 2;
        }
    }
    // 4 of a kind?!
    for (var i = 0; i < cards.length - 3; i++) {
        if (cards[i].type == cards[i+3].type) {
            score += 2;
        }
    }
    return score;
}

Hand.prototype.fifteenScore = function () {
    var cards = this.cards.sort(function(a,b){return a.index-b.index});
    var score = 0;
    // 2-card combos
    for (var i = 0; i < cards.length - 1; i++) {
        if (cards[i].value + cards[i+1].value == 15) {
            score += 2;
        }
    }
    for (var i = 0; i < cards.length - 2; i++) {
        if (cards[i].value + cards[i+2].value == 15) {
            score += 2;
        }
    }
    for (var i = 0; i < cards.length - 3; i++) {
        if (cards[i].value + cards[i+3].value == 15) {
            score += 2;
        }
    }
    if (cards[0].value + cards[4].value == 15) {
        score += 2;
    }
    // 3-card combos
    var randomPair = cards[0].value + cards[1].value;
    for (var i = 2; i < cards.length; i++) {
        if (randomPair + cards[i].value == 15) {
            score += 2;
        }
    }
    randomPair = cards[0].value + cards[2].value;
    for (var i = 3; i < cards.length; i++) {
        if (randomPair + cards[i].value == 15) {
            score += 2;
        }
    }
    if (cards[0].value + cards[3].value + cards[4].value == 15) {
        score += 2;
    }
    randomPair = cards[1].value + cards[2].value;
    for (var i = 3; i < cards.length; i++) {
        if (randomPair + cards[i].value == 15) {
            score += 2;
        }
    }
    if (cards[2].value + cards[3].value + cards[4].value == 15) {
        score += 2;
    }
    // 4-card combos
    if (cards[0].value + cards[1].value + cards[2].value + cards[3].value == 15) {
        score += 2;
    }
    if (cards[0].value + cards[1].value + cards[2].value + cards[4].value == 15) {
        score += 2;
    }
    if (cards[0].value + cards[1].value + cards[3].value + cards[4].value == 15) {
        score += 2;
    }
    if (cards[0].value + cards[2].value + cards[3].value + cards[4].value == 15) {
        score += 2;
    }
    if (cards[1].value + cards[2].value + cards[3].value + cards[4].value == 15) {
        score += 2;
    }
    // 5-card combo
    var tempCount = 0;
    for (var i = 0; i < cards.length; i++) {
        tempCount += cards[i].value;
    }
    if (tempCount == 15) {
        score += 2;
    }
    return score;
}

Hand.prototype.runScore = function () {
    var cards = this.cards.sort(function(a,b){return a.index-b.index});
    var score = 0;
    var i = 0;
    while (i < cards.length) {
        var cardsInRun = 1;
        var multiplier = 1;
        var cardsInPair = 1;
        var totalPairs = 0;
        var threeOfKind = false;
        var scoreThis = function () {
            if (cardsInRun >= 3) {
                if (threeOfKind == true) {
                    score += 3 * cardsInRun;
                } else if (totalPairs == 2) {
                    score += 4 * cardsInRun;
                } else if (totalPairs == 1) {
                    score += 2 * cardsInRun;
                } else {
                    score += cardsInRun * multiplier;
                }
            }
            return score;
        }
        for (var j = i; j < cards.length; j++) {
            if (cards[j+1].type == cards[j].type + 1) {
                cardsInRun += 1;
                if (cardsInPair == 2) {
                    totalPairs += 1;
                }
                cardsInPair = 1;
                if (j == cards.length - 2) {
                    scoreThis();
                    return score;
                }
            } else if (cards[j+1].type == cards[j].type) {
                multiplier += 1;
                cardsInPair += 1;
                if (cardsInPair == 3) {
                    threeOfKind = true;
                }
                if (j == 3) {
                    totalPairs += 1;
                }
                if (j == cards.length - 2) {
                    scoreThis();
                    return score;
                }
            } else {
                if (j == cards.length - 2) {
                    scoreThis();
                    return score;
                }
                scoreThis();
                i = j+1;
                break;
            }
        }
    }
    return score;
}

Hand.prototype.totalScore = function() {
  return this.nobScore() + this.flushScore() + this.pairScore() + this.fifteenScore() + this.runScore();
}

if (typeof exports === 'undefined') {
   var exports = { };
}

exports.Game = Game;
exports.Hand = Hand;
exports.Player = Player;

// exports.Room = Room;
// exports.Table = Table;

// // ROOM OBJECT

// function Room(name) {
//   this.name = name;
//   this.tables = [];
//   this.players = [];
// }

// Room.prototype.addPlayer = function(player) {
//   this.players.push(player);
// }

// Room.prototype.addTable = function(table) {
//   this.tables.push(table);
// }

// // TABLE OBJECT

// function Table(tableID) {
//   this.tableID = tableID;
//   this.status = "available";
//   this.roomName = null;
//   this.players = [];
//   this.deck = [];
//   this.cardsOnTable = [];
//   this.playerLimit = 2;
//   this.gameObj = null;
// }

// Table.prototype.setRoomName = function(roomName) {
//   this.roomName = roomName;
// }

// OLD

// Game.prototype.createDeck = function() {
//   var suits = ["H", "C", "S", "D"];
//   var deck = [];
//   var n = 52;
//   var index = n / suits.length;

//   var count = 0;
//   for (i = 0; i < suits.length; i++) {
//     for(j = 1; j <= index; j++) {
//       deck[count++] = j + suits[i];
//     }
//   }

//   return deck;
// }

// Game.prototype.shuffleDeck = function(deck) {
//   var i = deck.length, j, tempi, tempj;

//   if (i === 0) return false;

//   while(--i) {
//     j = Math.floor(Math.random() * (i + 1));
//     tempi = deck[i];
//     tempj = deck[j];
//     deck[i] = tempj;
//     deck[j] = tempi;
//   }

//   return deck;
// }

// var handScore = function (hand) {
//     var nob = nobScore(hand);
//     var flush = flushScore(hand);
//     var pair = pairScore(hand);
//     var fifteen = fifteenScore(hand);
//     var run = runScore(hand);
//     if (nob > 0) {
//         console.log("His Nobs: " + nob);
//     }
//     if (flush > 0) {
//         console.log("Flush score: " + flush);
//     }
//     if (pair > 0) {
//         console.log("Pairs score: " + pair);
//     }
//     if (fifteen > 0) {
//         console.log("Fifteens score: " + fifteen);
//     }
//     if (run > 0) {
//         console.log("Run score: " + run);    
//     }
//     var totalScore = nob + pair + fifteen + flush + run;
//     console.log("TOTAL SCORE: " + totalScore);
// }
