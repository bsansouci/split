var __LOGIC = __LOGIC || {};
var __DISPLAY = __DISPLAY || {};
var __OPPONENT = __OPPONENT || {};

(function(g, display, logic, opponent) {
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

  function sendTurn() {
    var str = encrypt(g.moveHistory);
    if(str.length > 255) {
      console.log("ERROR: moveHistory parsed is > 255 chars");
      return;
    }
    var b = new g.ParseGameBoard();

    // b.save({
    //   userID: g.userID,
    //   opponentID: g.opponentID,
    //   board: g.board
    // }).then(function(object) {
    //   console.log(object);
    // });
    // FB.ui({method: 'apprequests',
    //   message: 'This is a newer message.',
    //   to: '1216678154',
    //   action_type:'turn',
    //   data: str
    // }, function(response){
    //   console.log(response);
    // });
  }

  function parseAndClear(obj) {
    var allMoves = decrypt(obj.data);
    logic.makeEnemyMoves(allMoves);
    allMoves.map(display.drawMove);
    console.log("THERE IS A LINE OF CODE THAT NEEDS TO BE UNCOMMENTED");
    // this.clearEvent(obj.id);
  }

  function clearEvent(requestId) {
    FB.api(requestId, 'delete', function(response) {
      console.log(response);
    });
  }
  return this;
})(__GLOBAL, __DISPLAY, __LOGIC, __OPPONENT);