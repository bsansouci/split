var BOARD_SIZE = 8;
var NUM_ROWS = 3;

function initialize(){
  for (var i = 0; i < BOARD_SIZE; i++){
    for (var j = 0; j < NUM_ROWS; j++){
      var enemy = new Piece();
      enemy.ally = false;
      enemy.x = ((i+1)%2) + ~~(i/2);
      enemy.y = i;
      board[enemy.x][enemy.y] = enemy;

      var ally = new Piece();
      ally.x = ((i)%2) + ~~(i/2);
      ally.y = BOARD_SIZE - 1 - i;
      board[ally.x][ally.y] = ally;
    }
  }
}

function makeMove(move) {

}

function makeEnemyMove() {

}

function possibleMoves() {

}
