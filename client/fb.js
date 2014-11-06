var __LOGIC = __LOGIC || {};
var __DISPLAY = __DISPLAY || {};
var __OPPONENT = __OPPONENT || {};

(function(g, display, logic, opponent) {
  Parse.initialize("nf0GIoSnS5rGiblTT59PZ9B3j4WOAmWIXqta2lbT", "zliwaIweOFowVIvAS4Kprxc3yrbVS7fHg2IDdVy4");
  g.ParseGameBoard = Parse.Object.extend("gameboard");

  opponent.sendTurn = sendTurn;
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
    g.userID = parseInt(privateData.userID);
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

        g.opponentID = parseInt(val.data[0].from.id);
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
            startGame(results[0], _.partial(clearEvent, val.data[0].id));
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
      query1.equalTo("user1ID", g.userID);
      var query2 = new Parse.Query(g.ParseGameBoard);
      query2.equalTo("user2ID", g.userID);
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
            if (results[i].get("user1ID") === g.userID){
              oppID = results[i].get("user2ID");
            } else {
              oppID = results[i].get("user1ID");
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
          sendButton.onclick = _.partial(sendRequest, response.data[i].id, response.data[i].name);
          sendButton.style.width = '200px';
          mfsForm.appendChild(sendButton);
          mfsForm.appendChild(document.createElement('br'));
        }
        container.appendChild(mfsForm);
      });

      FB.api('/me/invitable_friends', function(response) {
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
          sendButton.onclick = _.partial(sendRequest, response.data[i].id, response.data[i].name);
          sendButton.style.width = '200px';
          inviteForm.appendChild(sendButton);
          inviteForm.appendChild(document.createElement('br'));
        }
      });
    }

    // ------------------------------------------------------------------------

    MutationObserver = window.parent.MutationObserver || window.parent.WebKitMutationObserver;

    var observer = new MutationObserver(_.partial(function(FB, mutations, observer) {
      console.log(mutations);
      if(mutations.length === 0) return;

      var p = document.getElementsByClassName("_3soi")[0];
      if(typeof p === "undefined") return;

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
            if(parseInt(val.data[0].from.id) !== g.opponentID) return;

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
                startGame(results[0], _.partial(clearEvent, val.data[0].id));
              },
              error: function(error) {
                console.log("Error when querying parse");
              }
            });
          });
      }
    }, FB));

    observer.observe(document.getElementById("pagelet_dock"), {
      subtree: true,
      attributes: true,
      childList: true,
      characterData: true,
      attributeOldValue: true,
      characterDataOldValue: true
    });
  }

  // Gets called after clicking a friend to invite
  function sendRequest(id, name) {
    console.log("id:" + id);
    requestCallback(id, name);
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
  function requestCallback(id, name) {
    // TODO: Set IDs.
    g.opponentID = parseInt(id);
    g.opponentName = name;
    g.concatID = (g.userID < g.opponentID) ? "" + g.userID + g.opponentID : "" + g.opponentID + g.userID;
    document.getElementById("main-screen").style.display = "none";
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
        if(results[0].get("user1ID") === g.userID) {
          g.opponentID = results[0].get("user2ID");
        } else {
          g.opponentID = results[0].get("user2ID");
        }

        g.concatID = (g.userID < g.opponentID) ? "" + g.userID + g.opponentID : "" + g.opponentID + g.userID;
        document.getElementById("main-screen").style.display = "none";
        startGame(results[0]);
        // FB.api(privateData.userID + '/apprequests?fields=id,application,to,from,data,message,action_type,object,created_time&access_token=' + privateData.accessToken,          function(val) {

        //   startGame(results[0]);
        // });
      },
      error: function(results){
        console.log("Error, could not load game");
      }
    });
  }

  function sendTurn(callback) {
    // If you're playing locally or something messed up, don't push move.
    if (g.userID === undefined || g.opponentID === undefined) return callback();
    if(!g.concatID) g.concatID = (g.userID < g.opponentID) ? "" + g.userID + g.opponentID : "" + g.opponentID + g.userID;

    var b = new g.ParseGameBoard();
    var query = new Parse.Query(g.ParseGameBoard);
    query.equalTo("concatID", g.concatID);
    query.find({
      success: function(results) {
        if(results.length === 0) {
          b.save({
            user1ID: g.userID,
            user2ID: g.opponentID,
            concatID: g.concatID,
            previousTurns: [g.moveHistory],
            BOARD_SIZE: g.BOARD_SIZE,
            NUM_ROWS: g.NUM_ROWS
          }).then(function(object) {
            FB.ui({method: 'apprequests',
              message: 'Hey ' + g.opponentName + ' it\'s your turn!',
              to: g.opponentID,
              action_type:'turn',
            }, function(response){
              if (callback) callback();
              console.log(response);
            });
          });
          return;
        }

        results[0].add("previousTurns", g.moveHistory);
        results[0].save().then(function(o) {
          FB.ui({method: 'apprequests',
            message: 'Hey ' + g.opponentName + ' it\'s your turn!',
            to: g.opponentID,
            action_type:'turn',
          }, function(response){
            if (callback) callback();
            console.log(response);
          });
        });
      },
      error: function(error) {
        if (callback) callback();
        console.log("Error when saving the same state in Parse");
      }
    });
  }

  function clearEvent(requestID) {
    FB.api(requestID, 'delete', function(response) {
      console.log("Event cleared", response);
    });
  }

  return this;
})(__GLOBAL, __DISPLAY, __LOGIC, __OPPONENT);
