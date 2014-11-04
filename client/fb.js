var __LOGIC = __LOGIC || {};
var __DISPLAY = __DISPLAY || {};
var __OPPONENT = __OPPONENT || {};

(function(g, display, logic, opponent) {
  Parse.initialize("nf0GIoSnS5rGiblTT59PZ9B3j4WOAmWIXqta2lbT", "zliwaIweOFowVIvAS4Kprxc3yrbVS7fHg2IDdVy4");
  g.ParseGameBoard = Parse.Object.extend("gameboard");

  opponent.sendTurn = sendTurn;
  opponent.parseAndClear = parseAndClear;
  opponent.clearEvent = clearEvent;

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
    g.userID = privateData.userID;
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
        g.concatID = (g.userID < g.opponentID) ? "" + g.userID + g.opponentID : "" + g.opponentID + g.userID;

        var query = new Parse.Query(g.ParseGameBoard);
        query.equalTo("concatID", g.concatID);
        query.find({
          success: function(results) {
            if(results.length === 0) {
              console.log("No board found");
              // No data found, so load a new game.
              startGame();
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
          }
        });
      });
    } else {
      // Pick game to resume
      var query = new Parse.Query(g.ParseGameBoard);
      var query1 = new Parse.Query(g.ParseGameBoard);
      query1.equalTo("opponentID", g.userID);
      var query2 = new Parse.Query(g.ParseGameBoard);
      query2.equalTo("userID", g.userID);
      query = Parse.Query.or(query1, query2);
      console.log("userID:", g.userID);
      query.find({
        success: function(results){
          if (results.length === 0) return console.log("No Games to Load");
          var container = document.getElementById('loadgame');
          var loadForm = document.createElement('form');
          var title = document.createElement('div');
          title.innerHTML = "<h3>Load a Game</h3>";
          loadForm.appendChild(title);
          for(var i = 0; i < results.length; i++){
            var oppId;
            if (results[i].opponentID === g.userID){
              oppID = results[i].get("userID");
            } else {
              oppID = results[i].get("opponentID");
            }
            var loadButton = document.createElement('input');
            loadButton.type = "button";
            loadButton.value = oppID;
            loadButton.style.width = '200px';
            loadButton.onclick = _.partial(loadCallback, results[i].get("concatID"));
            loadForm.appendChild(loadButton);
            loadForm.appendChild(document.createElement('br'));
          }
          container.appendChild(loadForm);
        },
        error: function(error){
          console.log("Could not load games");
        }
      });

      // Start New Game:
      FB.api('/me/friends', function(response) {
        console.log(response);
        var container = document.getElementById('mfs');
        var mfsForm = document.createElement('form');
        mfsForm.id = 'mfsForm';
        var title = document.createElement('div');
        title.innerHTML = "<h3>Start New Game</h3>";
        mfsForm.appendChild(title);
        for(var i = 0; i < response.data.length; i++) {
          var sendButton = document.createElement('input');
          sendButton.type = 'button';
          sendButton.value = response.data[i].name;
          sendButton.onclick = _.partial(sendRequest, response.data[i].id);
          sendButton.style.width = '200px';
          mfsForm.appendChild(sendButton);
          mfsForm.appendChild(document.createElement('br'));
        }
        container.appendChild(mfsForm);
      });

      FB.api('/me/invitable_friends', function(response) {
        console.log(response);
        var container = document.getElementById('invitenew');
        var inviteForm = document.createElement('div');
        inviteForm.style.height = '300px';
        inviteForm.style.width = '250px';
        inviteForm.style.overflow = 'scroll';
        inviteForm.id = 'inviteForm';
        var title = document.createElement('div');
        title.innerHTML = "<h3>Invite New Friends to Checkers</h3>";
        container.appendChild(title);
        container.appendChild(inviteForm);
        for(var i = 0; i < response.data.length; i++) {
          var sendButton = document.createElement('input');
          sendButton.type = 'button';
          sendButton.value = response.data[i].name;
          sendButton.onclick = _.partial(sendRequest, response.data[i].id);
          sendButton.style.width = '200px';
          inviteForm.appendChild(sendButton);
          inviteForm.appendChild(document.createElement('br'));
        }
      });
    }
  }

  // Gets called after clicking a friend to invite
  function sendRequest(id) {
    console.log("id:" + id);
    requestCallback(null, id);
    // Get the list of selected friends
    // var sendUIDs = '';
    // var mfsForm = document.getElementById('mfsForm');
    //   for(var i = 0; i < mfsForm.friends.length; i++) {
    //     if(mfsForm.friends[i].checked) {
    //       sendUIDs += mfsForm.friends[i].value + ',';
    //     }
    //   }

    // // Use FB.ui to send the Request(s)
    // FB.ui({method: 'apprequests',
    //   to: sendUIDs,
    //   title: 'Checkers',
    //   message: 'Try Checkers!',
    // }, _.partial(requestCallback, id));
  }

  // Gets called after sending the new game request.
  function requestCallback(response, id) {
    console.log(response);
    // TODO: Set IDs.
    g.opponentID = id;
    startGame();
  }

  // Gets called after clicking a loadable game.
  function loadCallback(id){
    console.log("loading: " + id);
    var query = new Parse.Query(g.ParseGameBoard);
    query.equalTo("concatID", id);
    query.find({
      success: function(results){
        if (results.length < 1) return console.log("Game does not exist");
        if (results.length > 1) return console.log("Too many games found");
        
        FB.api(privateData.userID + '/apprequests?fields=id,application,to,from,data,message,action_type,object,created_time&access_token=' + privateData.accessToken,          function(val) {
          startGame(results[0], _.partial(parseAndClear, val.data[0]));
        });
      },
      error: function(results){
        console.log("Error, could not load game");
      }
    });
  }

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
    // If you're playing locally or something messed up, don't push move.
    if (g.userID === undefined || g.opponentID === undefined) return callback();
    var str = encrypt(g.moveHistory);
    if(str.length > 255) {
      console.log("ERROR: moveHistory parsed is > 255 chars");
      return;
    }

    var b = new g.ParseGameBoard();
    var query = new Parse.Query(g.ParseGameBoard);
    query.equalTo("concatID", g.concatID);
//    query.equalTo("userID", g.userID);
//    query.equalTo("opponentID", g.opponentID);
    query.find({
      success: function(results) {
        if(results.length === 0) {
          console.log(g.boardCopy[5][4]);
          b.save({
            userID: g.userID,
            opponentID: g.opponentID,
            concatID: g.concatID,
            lastMove: g.userID,
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
        console.log(g.allyNumCaptured, g.enemyNumCaptured);
        results[0].set("userID", g.userID);
        results[0].set("opponentID", g.opponentID);
        results[0].set("concatID", g.concatID);
        results[0].set("lastMove", g.userID);
        results[0].set("allyNumCaptured", g.allyNumCaptured);
        results[0].set("enemyNumCaptured", g.enemyNumCaptured);
        results[0].set("board", g.boardCopy);
        results[0].set("BOARD_SIZE", g.BOARD_SIZE);
        results[0].set("NUM_ROWS", g.NUM_ROWS);
        results[0].set("moveHistory", g.moveHistory);

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
    if (allMoves.length === 0) return console.log("No Moves.");
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

  function clearEvent(requestID) {
    FB.api(requestID, 'delete', function(response) {
      console.log(response);
    });
  }
  return this;
})(__GLOBAL, __DISPLAY, __LOGIC, __OPPONENT);
