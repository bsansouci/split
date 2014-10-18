var BOARD_SIZE = 8;
var NUM_ROWS = 3;

function initialize(){
  for (var i = 0; i < BOARD_SIZE/2; i++){
    for (var j = 0; j < NUM_ROWS; j++){
      var enemy = new Piece();
      enemy.ally = false;
      enemy.x = ((j+1)%2) + ~~(i*2);
      enemy.y = j;
      board[enemy.x][enemy.y] = enemy;

      var ally = new Piece();
      ally.x = (j%2) + ~~(i*2);
      ally.y = BOARD_SIZE - 1 - j;
      board[ally.x][ally.y] = ally;
    }
  }
}

function isValid(x, y) {
  return (x >= 0 && y >= 0 && x < BOARD_SIZE && y < BOARD_SIZE);
}

function reverseMove(move){
  move.srcX = BOARD_SIZE - move.srcX;
  move.srcY = BOARD_SIZE - move.srcY;
  move.destX = BOARD_SIZE - move.destX;
  move.destY = BOARD_SIZE - move.destY;
}

function possibleSubMoves(piece) {
  var xOffsets;
  var yOffsets;
  if (piece.isKing){
    var xOffsets = [1,1,-1,-1];
    var yOffsets = [1,-1,1,-1];
  } else if (piece.isAlly) {
    var xOffsets = [1,-1];
    var yOffsets = [-1,-1];
  } else if (!piece.isAlly) {
    var xOffsets = [1,-1];
    var yOffsets = [1,1];
  }
  var moves = [];

  for (var i = 0; i < xOffsets.length; i++){
    var isFinal = true;
    var x = piece.x + xOffsets[i];
    var y = piece.y + yOffsets[i];
    if (!isValid(x,y)){
      continue;
    }
    if (board[x][y]){
      x += xOffsets[i];
      y += yOffsets[i];
      isFinal = false;
      if (!isValid(x,y) || board[x][y]){
        continue;
      }
    }
    var m = new Move();
    m.srcX = piece.x;
    m.srcY = piece.y;
    m.destX = x;
    m.destY = y;
    m.isFinal = isFinal;
    moves.push(m);
  }
  return moves;
}

function makeFullMove(moves) {

}

function makeEnemyMove() {

}

