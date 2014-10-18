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


// This function sets isFinal correctly for 1 submove turns, but
// if there are jumps, the final one needs to be manually set.
function possibleSubMoves(piece, inProgress) {
  var xOffsets;
  var yOffsets;
  if (piece.isKing){
    xOffsets = [1,1,-1,-1];
    yOffsets = [1,-1,1,-1];
  } else if (piece.isAlly) {
    xOffsets = [1,-1];
    yOffsets = [-1,-1];
  } else if (!piece.isAlly) {
    xOffsets = [1,-1];
    yOffsets = [1,1];
  }
  var moves = [];

  for (var i = 0; i < xOffsets.length; i++){
    var isFinal = true;
    var x = piece.x + xOffsets[i];
    var y = piece.y + yOffsets[i];
    if (!isValid(x,y)){
      continue;
    }
    if (inProgress || board[x][y]){
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
  var last;
  var failure = false;
  for (var move in moves){
    var x = move.srcX;
    var y = move.srcY;
    if (isValid(x,y) && board[x][y]){

      // TODO this is probably not what you wanted to do
      if (possibleSubMoves(board[x][y].filter(move.equals))){
        // Valid move
        last = move;
        p = board[x][y];
        p.x = move.destX;
        p.y = move.destY;
        board[p.x][p.y] = p;
        board[x][y] = null;
      } else {
        failure = true;
        break;
      }
    }
  }

  if (failure){
    // Revert piece moves
    if (last){
      var first = move[0];
      p = board[last.destX][last.destY];
      p.x = first.srcX;
      p.y = first.srcY;
      board[last.destX][last.destY] = null;
      board[p.x][p.y] = p;
    }
  } else {
    // Remove jumped pieces
    for (move in moves){
      mid = getMiddle(move);
      if (!board[mid.x][mid.y].ally){
        pieceCaptured(board[mid.x][mid.y]);
        board[mid.x][mid.y] = null;
      }
    }
  }
}

function pieceCaptured(piece){
  // TODO: Just in case we want some action here...
  return;
}

function getMiddle(move){
  return {
    x: (move.destX - move.srcX)/2 + move.srcX,
    y: (move.destY - move.srcY)/2 + move.srcY
  };
}

function makeEnemyMove(moves) {
  moves.map(reverseMove);
  makeFullMove(moves);
}

