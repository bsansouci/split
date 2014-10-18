var game = new Phaser.Game(800, 600, Phaser.AUTO, 'checkers', { preload: preload, create: create });

var board;
var scale = 75;
function preload() {
  board = new Array(8);
  for (var i = board.length - 1; i >= 0; i--) {
    board[i] = new Array(8);
  }

  initialize();

  game.load.image('red-piece', 'assets/pics/red-piece.png');
  game.load.image('black-piece', 'assets/pics/black-piece.png');
}

function create() {
  drawPieces();
}

function drawPieces() {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      if(board[i][j]) {
        var sprite = game.add.sprite(board[i][j].x * scale, board[i][j].y * scale, board[i][j].ally ? 'red-piece' : 'black-piece');
        sprite.scale.setTo(0.4, 0.4);
      }
    }
  }
}

function drawBoard(argument) {
  // for (var i = 0; i < BOARD_SIZE; i++) {
  //   Things[i]
  // };
  // line1 = new Phaser.Line(handle1.x, handle1.y, handle2.x, handle2.y);
}