var game = new Phaser.Game(800, 600, Phaser.AUTO, 'checkers', { preload: preload, create: create });

var board;
var scale = 75;
var spriteScale = 0.4;
var BOARD_SIZE = 8;
var NUM_ROWS = 3;


function preload() {
  board = new Array(BOARD_SIZE);
  for (var i = board.length - 1; i >= 0; i--) {
    board[i] = new Array(BOARD_SIZE);
  }

  initialize();

  game.load.image('red-piece', 'assets/pics/red-piece.png');
  game.load.image('black-piece', 'assets/pics/black-piece.png');
}

function create() {
  var graphics = game.add.graphics(0, 0);
  drawBoard(graphics);
  drawPieces(graphics);
}

function drawPieces(graphics) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      if(board[i][j]) {
        var sprite = game.add.sprite(board[i][j].x * scale, board[i][j].y * scale, board[i][j].ally ? 'red-piece' : 'black-piece');
        sprite.scale.setTo(spriteScale, spriteScale);
        if(board[i][j].ally) {
          sprite.inputEnabled = true;
          sprite.events.onInputDown.add(_.partial(clicked, i, j, graphics), this);
        }
      }
    }
  }
}

function clicked(x, y, graphics, sprite) {
  drawBoard(graphics);
  graphics.beginFill(0x181818);
  graphics.lineStyle(5, 0x00d9ff, 1);
  graphics.drawRect(sprite.position.x, sprite.position.y, sprite.texture.width * sprite.scale.x, sprite.texture.height * sprite.scale.y);

  var possibleMoves = possibleSubMoves(board[x][y], []);
  console.log(possibleMoves);
  for (var i = 0; i < possibleMoves.length; i++) {
    graphics.beginFill(0x181818);
    graphics.lineStyle(5, 0x00d9ff, 1);
    var m = possibleMoves[i];
    graphics.drawRect(m.destX * scale, m.destY * scale, sprite.texture.width * scale, sprite.texture.height * scale);
  }
}

function drawBoard(graphics) {
  graphics.beginFill(0x181818);
  graphics.lineStyle(5, 0xffd900, 1);
  graphics.drawRect(0, 0, scale*BOARD_SIZE, scale*BOARD_SIZE);
  graphics.beginFill(0xFF3300);
  graphics.lineStyle(5, 0xffd900, 1);
  for (var i = 0; i < BOARD_SIZE/2; i++) {
    for (var j = 0; j < BOARD_SIZE; j++) {
      graphics.drawRect((j%2 + i*2)*scale, j*scale, scale, scale);
    }
  }
}
