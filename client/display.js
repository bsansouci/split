var LOGIC = LOGIC || {};
var __DISPLAY = __DISPLAY || {};
var __OPPONENT = __OPPONENT || {};

var startGame = _.partial(function(g, display, logic, opponent, parseObject, callback) {
  // Public functions
  display.drawMove = drawMove;

  // This function is instantiated in create()
  display.refresh = null;

  // Main
  g.game = new Phaser.Game(g.GAME_SCALE*g.BOARD_SIZE + 150,
        g.GAME_SCALE*g.BOARD_SIZE, Phaser.CANVAS, 'checkers', { preload: preload, create: create });

  function preload() {
    console.log("parseObject:", parseObject);
    if (parseObject &&
        parseObject !== undefined)
    {
      g.BOARD_SIZE = parseObject.get("BOARD_SIZE");
      g.NUM_ROWS = parseObject.get("NUM_ROWS");
      logic.initialize();
      var IAmUser1 = (parseObject.get("user1ID") === g.userID);
      var turns = parseObject.get("previousTurns");

      turns.slice(0,-1).map(function(e, i) {
        if(i%2 === +IAmUser1) {
          logic.makeEnemyMoves(e);
        } else {
          e.map(logic.movePiece);
        }
      });


      callback = _.partial(function(turns, IAmUser1, c){
        var lastTurn = turns[turns.length - 1];
        if (turns.length%2 !== +IAmUser1){
          lastTurn.map(logic.reverseMove);
        }
        var i = 0;
        function drawNextMove(){
          if (i < lastTurn.length)
            drawMove(lastTurn[i++], drawNextMove);
          else {
            if((IAmUser1 && turns.length % 2 === 0) ||
                (!IAmUser1 && turns.length % 2 === 1)) {
              g.state = g.GameState.NEW_MOVE;
            } else {
              g.state = g.GameState.WAITING;
            }
            if (c) c();
          }
        }
        g.state = g.GameState.ANIMATING;
        drawNextMove();
      }, turns, IAmUser1, callback);

    } else {
      logic.initialize();
    }

    g.game.load.image('red-piece', 'assets/pics/red-piece.png');
    g.game.load.image('black-piece', 'assets/pics/black-piece.png');
    g.game.load.image('red-king', 'assets/pics/red-king.png');
    g.game.load.image('black-king', 'assets/pics/black-king.png');
    g.game.load.image('menu-button', 'assets/pics/menu.png');
    try {
      g.game.load.image('profile',
        'https://graph.facebook.com/'+g.opponentID+
        '/picture?height=110&width=110');
    } catch (e) {
      g.game.load.image('profile', 'assets/pics/red-piece.png');
    }
  }

  function create() {
    var graphics = g.game.add.graphics(0, 0);
    drawBoard(graphics);
    drawPieces(graphics);
    display.refresh = _.partial(drawPieces, graphics);
    g.game.input.onDown.add(_.partial(anyClick, graphics), display);

    // Since we're loading asynchronously, we might need a callback (for
    // example when receiving a notification and needing to display the
    // opponnent's move)
    if(callback) callback();
  }

  function drawPieces(graphics) {
    var sprite;
    var i;
    var dest;
    for (i = 0; i < g.board.length; i++) {
      for (var j = 0; j < g.board[i].length; j++) {
        if(g.board[i][j]) {
          sprite = g.game.add.sprite(g.board[i][j].x * g.GAME_SCALE, g.board[i][j].y * g.GAME_SCALE, g.board[i][j].isAlly ? 'red-piece' : 'black-piece');
          g.board[i][j].sprite = sprite;
          sprite.scale.setTo(g.SPRITE_SCALE, g.SPRITE_SCALE);
        }
      }
    }
    sprite = g.game.add.sprite(g.BOARD_SIZE*g.GAME_SCALE+20, 20, 'profile');
    var style = { font: "20px Arial", fill: "#FFFFFF", align: "center" };
    var x = g.BOARD_SIZE*g.GAME_SCALE + 15;
    g.game.add.text(x, 140, wordWrap(g.opponentName, 12), style);

    for (i = 0; i < g.enemyNumCaptured; i++){
      dest = calcCapturedDest(true, i);
      sprite = g.game.add.sprite(dest.x, dest.y, 'red-piece');
      sprite.scale.setTo(g.SPRITE_SCALE, g.SPRITE_SCALE);
    }

    for (i = 0; i < g.allyNumCaptured; i++){
      dest = calcCapturedDest(false, i);
      sprite = g.game.add.sprite(dest.x, dest.y, 'black-piece');
      sprite.scale.setTo(g.SPRITE_SCALE, g.SPRITE_SCALE);
    }

      sprite = g.game.add.sprite(g.GAME_SCALE*g.BOARD_SIZE + 25,
          g.GAME_SCALE*g.BOARD_SIZE/2, 'menu-button');
      sprite.inputEnabled = true;
      sprite.events.onInputDown.add(function(){
        
        g.game.destroy();
        g.game = null;
        document.getElementById("main-screen").style.display = "";
      }, this);
  }
  
  function calcCapturedDest(isAlly, numCaptured){
    if (isAlly && typeof numCaptured === 'undefined'){
      numCaptured = g.enemyNumCaptured;
    } else if (typeof numCaptured === 'undefined'){
      numCaptured = g.allyNumCaptured;
    }
    return {
      x: (g.GAME_SCALE * g.BOARD_SIZE) + 40,
      y: (isAlly ? 250 : 500) - (g.STACK_INCREMENT * numCaptured)
    };
  }

  function anyClick(graphics, pointer) {
    if (pointer.x > g.BOARD_SIZE*g.GAME_SCALE ||
          pointer.y > g.BOARD_SIZE*g.GAME_SCALE) return;
    var pos = getBoardPos(pointer);
    // console.log("State: ", g.state, " Pos: ", pos, "currentPossibleMoves", g.currentPossibleMoves);
    switch(g.state) {
      case g.GameState.NEW_MOVE:
        // We make a copy of the board that we're going to send to parse
        g.boardCopy = logic.cloneBoard(g.board);
        g.state = g.GameState.CONTINUE;
        if(g.board[pos.x][pos.y] && g.board[pos.x][pos.y].isAlly)
          return clickedOnPiece(pos.x, pos.y, graphics);
        break;
      case g.GameState.CONTINUE:
        var p = {destX: pos.x, destY: pos.y};
        var move = _.where(g.currentPossibleMoves, p)[0];

        if(!move && g.moveHistory.length === 0){
          if(g.board[pos.x][pos.y] && g.board[pos.x][pos.y].isAlly){
            cancelMove(graphics);
            clickedOnPiece(pos.x, pos.y, graphics);
            return;
          } else return cancelMove(graphics);
        }
        else if (!move) return;

        g.moveHistory.push(move);
        if (!move.isFinal){
          clickedOnPiece(pos.x, pos.y, graphics);
        } else {
          drawBoard(graphics);
          g.state = g.GameState.NEW_MOVE;
          submitMove();
        }
        drawMove(move);
        break;
      case g.GameState.WAITING:
        break;
    }

  }

  function cancelMove(graphics){
    g.currentPossibleMoves = [];
    g.state = g.GameState.NEW_MOVE;
    g.moveHistory = [];
    drawBoard(graphics);
  }

  function submitMove(){
    g.state = g.GameState.WAITING;
    opponent.sendTurn(function() {
      g.currentPossibleMoves = [];
      g.moveHistory = [];
    });
  }

  function getBoardPos(pointer) {
    return {
      x: ~~(pointer.x / g.GAME_SCALE),
      y: ~~(pointer.y / g.GAME_SCALE)
    };
  }

  function clickedOnPiece(x, y, graphics) {
    drawBoard(graphics);
    graphics.beginFill(0x181818);
    graphics.lineStyle(5, 0x00d9ff, 1);
    graphics.drawRect(x * g.GAME_SCALE, y * g.GAME_SCALE, g.GAME_SCALE, g.GAME_SCALE);

    var possibleMoves = logic.possibleSubMoves(g.board[x][y]);

    for (var i = 0; i < possibleMoves.length; i++) {
      graphics.beginFill(0x181818);
      graphics.lineStyle(5, 0x00d9ff, 1);
      var m = possibleMoves[i];
      graphics.drawRect(m.destX * g.GAME_SCALE, m.destY * g.GAME_SCALE, g.GAME_SCALE, g.GAME_SCALE);
    }
    g.currentPossibleMoves = possibleMoves;
  }

  function drawMove(move, callback) {
    var state = g.state;
    g.state = g.GameState.ANIMATING;
    piece = g.board[move.srcX][move.srcY];
    piece.sprite.bringToTop();
    var tween = g.game.add.tween(piece.sprite.position);
    var dest = {x: move.destX * g.GAME_SCALE, y: move.destY * g.GAME_SCALE};
    tween.to(dest, 500, Phaser.Easing.Quadratic.Out, true);
    tween.onComplete.add(_.partial(afterMove, move, state, callback), this);
  }

  function afterMove(move, formerState, callback){
    if (move.captures) {
      var mid = logic.getMiddle(move);
      var captured = g.board[mid.x][mid.y];
      captured.sprite.bringToTop();
      var tween = g.game.add.tween(captured.sprite.position);
      var dest = calcCapturedDest(captured.isAlly);
      tween.to(dest, 500, Phaser.Easing.Quadratic.Out, true);
    }

    logic.movePiece(move);

    // Convert to king when applicable
    if (piece.isKing && !!piece.sprite.key.match("piece")){
      piece.sprite.loadTexture((piece.isAlly ? "red" : "black") +"-king");
    }

    g.state = formerState;
    if(callback) callback();
  }


  function drawBoard(graphics) {
    var boardSizePx = g.GAME_SCALE*g.BOARD_SIZE;
    graphics.beginFill(0x601407);
    graphics.drawRect(0, 0, boardSizePx+150, boardSizePx);

    graphics.beginFill(0x601234);

    graphics.beginFill(0x181818);
    graphics.lineStyle(5, 0xffd900, 1);
    graphics.drawRect(0, 0, boardSizePx, boardSizePx);
    graphics.beginFill(0xFF3300);
    graphics.lineStyle(5, 0xffd900, 1);
    for (var i = 0; i < g.BOARD_SIZE/2; i++) {
      for (var j = 0; j < g.BOARD_SIZE; j++) {
        graphics.drawRect((j%2 + i*2)*g.GAME_SCALE, j*g.GAME_SCALE, g.GAME_SCALE, g.GAME_SCALE);
      }
    }
  }

  function wordWrap(str, maxWidth){
    var broken = str.split(" ");
    var count = 0;
    var retStr = "";
    for (var i = 0; i < broken.length; i++){
      var word = broken[i];
      count += word.length + 1;
      if (count > maxWidth){
        retStr += word + "\n";
        count = 0;
      } else {
        retStr += word + " ";
      }
    }
    return retStr;
  }

  return display;
},__GLOBAL, __DISPLAY, __LOGIC, __OPPONENT);
