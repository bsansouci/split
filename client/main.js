var __display = (function(g) {
  g.game = new Phaser.Game(600, 600, Phaser.AUTO, 'checkers', { preload: preload, create: create });

  function preload() {
    logic.initialize();

    g.game.load.image('red-piece', 'assets/pics/red-piece.png');
    g.game.load.image('black-piece', 'assets/pics/black-piece.png');
  }

  function create() {
    var graphics = g.game.add.graphics(0, 0);
    drawBoard(graphics);
    drawPieces(graphics);
    g.game.input.onDown.add(_.partial(anyClick, graphics), this);
  }

  function drawPieces(graphics) {
    for (var i = 0; i < g.board.length; i++) {
      for (var j = 0; j < g.board[i].length; j++) {
        if(g.board[i][j]) {
          var sprite = g.game.add.sprite(g.board[i][j].x * g.GAME_SCALE, g.board[i][j].y * g.GAME_SCALE, g.board[i][j].isAlly ? 'red-piece' : 'black-piece');
          g.board[i][j].sprite = sprite;
          sprite.scale.setTo(g.SPRITE_SCALE, g.SPRITE_SCALE);
          if(g.board[i][j].isAlly) {
            sprite.inputEnabled = true;
          }
        }
      }
    }
  }

  function anyClick(graphics, pointer) {
    var pos = getBoardPos(pointer);
    console.log("State: ", g.state, " Pos: ", pos, "currentPossibleMoves", g.currentPossibleMoves);
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
        this.drawMove(move);
        if (!move.isFinal){
          clickedOnPiece(pos.x, pos.y, graphics);
        } else {
          drawBoard(graphics);
          g.state = g.GameState.WAITING;

          opponent.sendTurn();

          submitMove();
        }
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

    var possibleMoves = possibleSubMoves(g.board[x][y]);

    for (var i = 0; i < possibleMoves.length; i++) {
      graphics.beginFill(0x181818);
      graphics.lineStyle(5, 0x00d9ff, 1);
      var m = possibleMoves[i];
      graphics.drawRect(m.destX * g.GAME_SCALE, m.destY * g.GAME_SCALE, g.GAME_SCALE, g.GAME_SCALE);
    }
    g.currentPossibleMoves = possibleMoves;
  }

  this.drawMove = function(move) {
    g.board[move.srcX][move.srcY].sprite.bringToTop();
    g.game.add.tween(g.board[move.srcX][move.srcY].sprite.position).to({x: move.destX * g.GAME_SCALE, y: move.destY * g.GAME_SCALE}, 1000, Phaser.Easing.Quadratic.Out, true);
    if (move.captures) {
      var mid = getMiddle(move);
      var capture = g.board[mid.x][mid.y];
      capture.sprite.destroy();
      pieceCaptured(capture);
    }
  };

  function drawBoard(graphics) {
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

  return this;
}).call(this, GLOBAL);
