var game = new Phaser.Game(800, 600, Phaser.AUTO, 'checkers', { preload: preload, create: create });

var GAME_SCALE = 75;
var SPRITE_SCALE = 0.4;
var BOARD_SIZE = 8;
var NUM_ROWS = 3;
var GameState = {
  CREATE_MOVE: "createmove"
};

var board = new Array(BOARD_SIZE);
for (var i = board.length - 1; i >= 0; i--) {
  board[i] = new Array(BOARD_SIZE);
}
var moveHistory = [];
var currentPossibleMoves = [];
var state = GameState.CREATE_MOVE;

function preload() {
  initialize();

  game.load.image('red-piece', 'assets/pics/red-piece.png');
  game.load.image('black-piece', 'assets/pics/black-piece.png');
}

function create() {
  var graphics = game.add.graphics(0, 0);
  drawBoard(graphics);
  drawPieces(graphics);
  game.input.onDown.add(_.partial(anyClick, graphics), this);
}

function drawPieces(graphics) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      if(board[i][j]) {
        var sprite = game.add.sprite(board[i][j].x * GAME_SCALE, board[i][j].y * GAME_SCALE, board[i][j].isAlly ? 'red-piece' : 'black-piece');
        board[i][j].sprite = sprite;
        sprite.scale.setTo(SPRITE_SCALE, SPRITE_SCALE);
        if(board[i][j].isAlly) {
          sprite.inputEnabled = true;
        }
      }
    }
  }
}

function anyClick(graphics, pointer) {
  var pos = getBoardPos(pointer);
  if(board[pos.x][pos.y]) return clickedOnPiece(pos.x, pos.y, graphics);

  var move = _.where(currentPossibleMoves, {destX: pos.x, destY: pos.y})[0];
  if(!move) return;

  currentPossibleMoves = [];
  drawBoard(graphics);
  drawMove(move);
  updateBoard(move);
}
function getBoardPos(obj) {
  return {
    x: ~~(obj.x / GAME_SCALE),
    y: ~~(obj.y / GAME_SCALE)
  };
}

function clickedOnPiece(x, y, graphics) {
  drawBoard(graphics);
  graphics.beginFill(0x181818);
  graphics.lineStyle(5, 0x00d9ff, 1);
  graphics.drawRect(x * GAME_SCALE, y * GAME_SCALE, GAME_SCALE, GAME_SCALE);

  var possibleMoves = possibleSubMoves(board[x][y], []);

  for (var i = 0; i < possibleMoves.length; i++) {
    graphics.beginFill(0x181818);
    graphics.lineStyle(5, 0x00d9ff, 1);
    var m = possibleMoves[i];
    graphics.drawRect(m.destX * GAME_SCALE, m.destY * GAME_SCALE, GAME_SCALE, GAME_SCALE);
  }
  currentPossibleMoves = possibleMoves;
}

function drawMove(move) {
  console.log(Phaser.Easing);
  game.add.tween(board[move.srcX][move.srcY].sprite.position).to({x: move.destX * GAME_SCALE, y: move.destY * GAME_SCALE}, 1000, Phaser.Easing.Quadratic.Out, true);
}

function drawBoard(graphics) {
  graphics.beginFill(0x181818);
  graphics.lineStyle(5, 0xffd900, 1);
  graphics.drawRect(0, 0, GAME_SCALE*BOARD_SIZE, GAME_SCALE*BOARD_SIZE);
  graphics.beginFill(0xFF3300);
  graphics.lineStyle(5, 0xffd900, 1);
  for (var i = 0; i < BOARD_SIZE/2; i++) {
    for (var j = 0; j < BOARD_SIZE; j++) {
      graphics.drawRect((j%2 + i*2)*GAME_SCALE, j*GAME_SCALE, GAME_SCALE, GAME_SCALE);
    }
  }
}
