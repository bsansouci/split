var GLOBAL = (function() {
  var obj = {
    GAME_SCALE: 75,
    SPRITE_SCALE: 0.4,
    BOARD_SIZE: 8,
    NUM_ROWS: 3,
    GameState: {
      CREATE_MOVE: "createmove"
    },
    moveHistory: [],
    currentPossibleMoves: [],
    game: null
  };
  obj.board = new Array(obj.BOARD_SIZE);
  for (var i = obj.BOARD_SIZE - 1; i >= 0; i--) {
    obj.board[i] = new Array(obj.BOARD_SIZE);
  }

  obj.state = obj.CREATE_MOVE;

  return obj;
})();