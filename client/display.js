var LOGIC = LOGIC || {};
var __DISPLAY = __DISPLAY || {};
var __OPPONENT = __OPPONENT || {};

var startGame = _.partial(function(g, display, logic, opponent, parseObject) {
  // Public functions
  display.drawMove = drawMove;

  // This function is instantiated in create()
  display.refresh = null;

  // Main
  g.game = new Phaser.Game(g.GAME_SCALE*g.BOARD_SIZE + 150,
        g.GAME_SCALE*g.BOARD_SIZE, Phaser.CANVAS, 'checkers', { preload: preload, create: create });

  function preload() {
    console.log("parseObject:" + parseObject);
    if ((parseObject !== undefined) &&
      (parseObject.board) &&
      (parseObject.move))
    {
      g.board = parseObject.board;
      g.userID = parseObject.userID;
      g.opponentID = parseObject.opponentID;
      g.allyNumCaptured = parseObject.allyNumCaptured;
      g.enemyNumCaptured = parseObject.enemyNumCaptured;
      g.board = parseObject.boardCopy;
      g.BOARD_SIZE = parseObject.BOARD_SIZE;
      g.NUM_ROWS = parseObject.NUM_ROWS;
    } else {
      logic.initialize();
    }

    g.game.load.image('red-piece', 'assets/pics/red-piece.png');
    g.game.load.image('black-piece', 'assets/pics/black-piece.png');
    g.game.load.image('red-king', 'assets/pics/red-king.png');
    g.game.load.image('black-king', 'assets/pics/black-king.png');
    try {
      g.game.load.image('profile',
        'http://graph.facebook.com/'+g.opponentID+
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
  }

  function drawPieces(graphics) {
    var sprite;
    for (var i = 0; i < g.board.length; i++) {
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
  }

  function anyClick(graphics, pointer) {
    var pos = getBoardPos(pointer);
    // console.log("State: ", g.state, " Pos: ", pos, "currentPossibleMoves", g.currentPossibleMoves);
    switch(g.state) {
      case g.GameState.NEW_MOVE:
        g.state = g.GameState.CONTINUE;
        if(g.board[pos.x][pos.y]) return clickedOnPiece(pos.x, pos.y, graphics);
        break;
      case g.GameState.CONTINUE:
        var p = {destX: pos.x, destY: pos.y};
        var move = _.where(g.currentPossibleMoves, p)[0];

        if(g.board[pos.x][pos.y]) return clickedOnPiece(pos.x, pos.y, graphics);

        if(!move && g.moveHistory.length === 0) return cancelMove(graphics);
        else if (!move) return;

        g.moveHistory.push(move);
        logic.movePiece(move);
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

        // Placeholder for enemy's move
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
    opponent.sendTurn();
    g.currentPossibleMoves = [];
    g.moveHistory = [];
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

  function drawMove(move) {
    var state = g.state;
    g.state = g.GameState.ANIMATING;
    piece = g.board[move.destX][move.destY];
    piece.sprite.bringToTop();
    var tween = g.game.add.tween(piece.sprite.position);
    var dest = {x: move.destX * g.GAME_SCALE, y: move.destY * g.GAME_SCALE};
    tween.to(dest, 500, Phaser.Easing.Quadratic.Out, true);
    tween.onComplete.add(_.partial(afterMove, move, state), this);
  }

  function afterMove(move, formerState){
    // Convert to king when applicable
    if (piece.isKing && !!piece.sprite.key.match("piece")){
      piece.sprite.loadTexture((piece.isAlly ? "red" : "black") +"-king");
    }

    //var move = context.move;
    if (move.captures) {
      var mid = logic.getMiddle(move);
      var captured = g.board[mid.x][mid.y];
      logic.pieceCaptured(captured);
      captured.sprite.bringToTop();
      var tween = g.game.add.tween(captured.sprite.position);
      var dest = {
        x: (g.GAME_SCALE * g.BOARD_SIZE) + 40,
        y: captured.isAlly ? (250 - g.STACK_INCREMENT*g.enemyNumCaptured) :
                              500 - g.STACK_INCREMENT*g.allyNumCaptured
      };
      tween.to(dest, 500, Phaser.Easing.Quadratic.Out, true);
      tween.onComplete.add(function () {g.state = formerState;}, this);
    } else {
      g.state = formerState;
    }
  }


  function drawBoard(graphics) {
    graphics.beginFill(0x601407);
    graphics.drawRect(0, 0, g.GAME_SCALE*g.BOARD_SIZE+150, g.GAME_SCALE*g.BOARD_SIZE);

    graphics.beginFill(0x181818);
    graphics.lineStyle(5, 0xffd900, 1);
    graphics.drawRect(0, 0, g.GAME_SCALE*g.BOARD_SIZE, g.GAME_SCALE*g.BOARD_SIZE);
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
