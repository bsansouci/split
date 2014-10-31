var __LOGIC = __LOGIC || {};
var __DISPLAY = __DISPLAY || {};
var __OPPONENT = __OPPONENT || {};

(function(g, display, logic, opponent) {
  Parse.initialize("nf0GIoSnS5rGiblTT59PZ9B3j4WOAmWIXqta2lbT", "zliwaIweOFowVIvAS4Kprxc3yrbVS7fHg2IDdVy4");
  g.ParseGameBoard = Parse.Object.extend("gameboard");

  window.fbAsyncInit = function() {
    var timeout = setTimeout(couldntConnect, 5000);
    console.log("fb init");
    FB.init({
      appId      : g.APP_ID,
      xfbml      : true,
      version    : 'v2.1',
      frictionlessRequests : true
    });

    FB.getLoginStatus(function(response) {
      clearTimeout(timeout);
      // Check login status on load, and if the user is
      // already logged in, go directly to the welcome message.
      console.log("getlogin");
      if (response.status == 'connected') {
        onConnected(FB.getAuthResponse());
      } else {
        // Otherwise, show Login dialog first.
        FB.login(function(rep) {
          onConnected(FB.getAuthResponse());
        }, {scope: 'user_friends, email'});
      }
    });
  };

  function couldntConnect() {
    console.log("Couldn't Connect");
    startGame();
  }

  function onConnected(privateData) {
    console.log("connected");
    var p = document.createElement('a');
    p.href = window.location.href;
    var allGetElements = [];
    if (p.search.length > 0){
      allGetElements = p.search.substring(1).split("&");
    }

    var data = {};
    allGetElements.map(function(val) {
      var tmp = val.split("=");
      data[tmp[0]] = tmp[1];
    });

    if(data.request_ids) {
      FB.api(privateData.userID + '/apprequests?fields=id,application,to,from,data,message,action_type,object,created_time&access_token=' + privateData.accessToken,          function(val) {
        // This will be used to get the profile picture
        g.opponentID = val.data[0].from.id;
        g.opponentName = val.data[0].from.name;
        g.userID = privateData.userID;

        var query = new Parse.Query(g.ParseGameBoard);
        query.equalTo("userID", g.userID);
        query.equalTo("opponentID", g.opponentID);
        query.find({
          success: function(results) {
            if(results.length === 0) {
              console.log("No board found");
              startGame(null, _.partial(parseAndClear, val.data[0]));
              return;
            }
            if(results.length > 1) {
              // LOL
              console.log("Too many boards found");
            }
            startGame(results[0], _.partial(parseAndClear, val.data[0]));
          },
          error: function(error) {
            console.log("Error when querying parse");
            // console.log("No board found");
            // startGame(null, _.partial(parseAndClear, val.data[0]));
          }
        });
      });
    } else {
      // Pick game to resume or start new game
      //var query = new Parse.Query(g.ParseGameBoard);
      //query.equalTo("userID", g.userID);
      //query.find({
      //  success: function(results) {
      //    if(results.length === 0) {
      //      console.log("No games found");
      //      return;
      //    }
      //    // LOL
      //    console.log("Too many boards found");
      //  },
      //  error: function(error) {
      //    console.log("No board found");
      //    startGame(function() {
      //      parseAndClear(val.data[0]);
      //    });
      //  }
      //});
      startGame();
    }
  }
  opponent.sendTurn = sendTurn;
  opponent.parseAndClear = parseAndClear;
  opponent.clearEvent = clearEvent;

  function encrypt(arr) {
    return arr.reduce(function(acc, val) {
      return acc += val.srcX + "." + val.srcY + ":" +
                    val.destX + "." + val.destY + (val.captures ? "T" : "F");
    }, "");
  }
  function decrypt(str) {
    if (typeof str === 'undefined' || str.length === 0) return [];
    var arr = [];
    var step1 = str.split(/(T|F)/g);

    // The last element is going to be empty so we skip it
    for (var i = 0; i < step1.length - 1; i+=2) {
      var step2 = step1[i].split(":");
      var src = step2[0].split(".");
      var dest = step2[1].split(".");

      var m = new Move();
      m.srcX = parseInt(src[0]);
      m.srcY = parseInt(src[1]);
      m.destX = parseInt(dest[0]);
      m.destY = parseInt(dest[1]);
      m.captures = (step1[i+1] === "T");
      m.isFinal = (i === step1.length - 3);
      arr.push(m);
    }

    return arr;
  }

  function sendTurn(callback) {
    var str = encrypt(g.moveHistory);
    if(str.length > 255) {
      console.log("ERROR: moveHistory parsed is > 255 chars");
      return;
    }

    var b = new g.ParseGameBoard();
    var query = new Parse.Query(g.ParseGameBoard);
    query.equalTo("userID", g.userID);
    query.equalTo("opponentID", g.opponentID);
    query.find({
      success: function(results) {
        if(results.length === 0) {
          console.log(g.boardCopy[5][4]);
          b.save({
            userID: g.userID,
            opponentID: g.opponentID,
            allyNumCaptured: g.allyNumCaptured,
            enemyNumCaptured:g.enemyNumCaptured,
            moveHistory: g.moveHistory,
            board: g.boardCopy,
            BOARD_SIZE: g.BOARD_SIZE,
            NUM_ROWS: g.NUM_ROWS
          }).then(function(object) {
            // console.log(object);
            // FB.ui({method: 'apprequests',
            //   message: 'This is a newer message.',
            //   to: '1216678154',
            //   action_type:'turn',
            //   data: str
            // }, function(response){
            //   console.log(response);
            // });
          });
          if (callback) callback();
          return;
        }

        results[0].userID = g.userID;
        results[0].opponentID = g.opponentID;
        results[0].allyNumCaptured = g.allyNumCaptured;
        results[0].enemyNumCaptured =g.enemyNumCaptured;
        results[0].board = g.boardCopy;
        results[0].BOARD_SIZE = g.BOARD_SIZE;
        results[0].NUM_ROWS = g.NUM_ROWS;
        results[0].moveHistory = g.moveHistory;

        results[0].save().then(function(o) {
          if (callback) callback();
          // FB.ui({method: 'apprequests',
          //   message: 'This is a newer message.',
          //   to: '1216678154',
          //   action_type:'turn',
          //   data: str
          // }, function(response){
          //   console.log(response);
          // });
        });
      },
      error: function(error) {
        if (callback) callback();
        console.log("Error when saving the same state in Parse");
        // b.save({
        //   userID: g.userID,
        //   opponentID: g.opponentID,
        //   allyNumCaptured: g.allyNumCaptured,
        //   enemyNumCaptured:g.enemyNumCaptured,
        //   board: g.boardCopy,
        //   BOARD_SIZE: g.BOARD_SIZE,
        //   NUM_ROWS: g.NUM_ROWS
        // }).then(function(object) {
        //   console.log(object);
        // });
      }
    });
  }

  function parseAndClear(obj) {
    var allMoves = decrypt(obj.data);

    // We first apply all the moves
    logic.makeEnemyMoves(allMoves);

    g.state = g.GameState.ANIMATING;
    // Then we draw the moves one after the other
    var i = 0;
    function recurse() {
      if (i < allMoves.length){
        display.drawMove(allMoves[i++], recurse);
      } else {
        g.state = g.GameState.NEW_MOVE;
      }

      display.drawMove(allMoves[i++], recurse);
    }
    recurse();

    console.log("A LINE OF CODE NEEDS TO BE UNCOMMENTED (clearEvent)");
    window.history.replaceState("", "", window.location.href.match(".+/"));
    // this.clearEvent(obj.id);
  }

  function clearEvent(requestId) {
    FB.api(requestId, 'delete', function(response) {
      console.log(response);
    });
  }
  return this;
})(__GLOBAL, __DISPLAY, __LOGIC, __OPPONENT);
