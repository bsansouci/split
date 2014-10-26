var GLOBAL = (function() {
  var obj = {
    GAME_SCALE: 75,
    SPRITE_SCALE: 0.25,
    BOARD_SIZE: 8,
    NUM_ROWS: 3,
    GameState: {
      NEW_MOVE: "newMove",
      CONTINUE: "continue",
      WAITING: "waiting",
      LOST: "lost",
      WON: "won"
    },
    moveHistory: [],
    currentPossibleMoves: [],
    game: null
  };
  obj.board = new Array(obj.BOARD_SIZE);
  obj.state = obj.GameState.NEW_MOVE;
  for (var i = obj.BOARD_SIZE - 1; i >= 0; i--) {
    obj.board[i] = new Array(obj.BOARD_SIZE);
  }

  return obj;
})();
