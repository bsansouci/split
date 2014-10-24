(function(g) {
  g.game = new Phaser.Game(800, 600, Phaser.AUTO, 'checkers', { preload: preload, create: create });

  function preload() {
    console.log(logic);
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
    if(g.board[pos.x][pos.y]) return clickedOnPiece(pos.x, pos.y, graphics);

    var move = _.where(g.currentPossibleMoves, {destX: pos.x, destY: pos.y})[0];
    if(!move) return;

    g.currentPossibleMoves = [];
    drawBoard(graphics);
    drawMove(move);
    updateBoard(move);
  }
  function getBoardPos(obj) {
    return {
      x: ~~(obj.x / g.GAME_SCALE),
      y: ~~(obj.y / g.GAME_SCALE)
    };
  }

  function clickedOnPiece(x, y, graphics) {
    drawBoard(graphics);
    graphics.beginFill(0x181818);
    graphics.lineStyle(5, 0x00d9ff, 1);
    graphics.drawRect(x * g.GAME_SCALE, y * g.GAME_SCALE, g.GAME_SCALE, g.GAME_SCALE);

    var possibleMoves = possibleSubMoves(g.board[x][y], []);

    for (var i = 0; i < possibleMoves.length; i++) {
      graphics.beginFill(0x181818);
      graphics.lineStyle(5, 0x00d9ff, 1);
      var m = possibleMoves[i];
      graphics.drawRect(m.destX * g.GAME_SCALE, m.destY * g.GAME_SCALE, g.GAME_SCALE, g.GAME_SCALE);
    }
    g.currentPossibleMoves = possibleMoves;
  }

  function drawMove(move) {
    g.game.add.tween(g.board[move.srcX][move.srcY].sprite.position).to({x: move.destX * g.GAME_SCALE, y: move.destY * g.GAME_SCALE}, 1000, Phaser.Easing.Quadratic.Out, true);
  }

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
}).call(this, GLOBAL);
