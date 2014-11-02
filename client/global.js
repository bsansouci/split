var __GLOBAL = (function() {
  var obj = {
    GAME_SCALE: 75,
    SPRITE_SCALE: 0.25,
    BOARD_SIZE: 8,
    NUM_ROWS: 3,
    STACK_INCREMENT: 10,
    APP_ID: 1468388983449543,
    GameState: {
      NEW_MOVE: "newMove",
      CONTINUE: "continue",
      WAITING: "waiting",
      LOST: "lost",
      WON: "won",
      ANIMATING: "animating"
    },
    moveHistory: [],
    currentPossibleMoves: [],
    game: null,
    allyNumCaptured: 0,
    enemyNumCaptured: 0,
    opponentID: 100001439708199,
    opponentName: "David"
  };
  obj.state = obj.GameState.NEW_MOVE;

  obj.board = new Array(obj.BOARD_SIZE);
  for (var i = obj.BOARD_SIZE - 1; i >= 0; i--) {
    obj.board[i] = new Array(obj.BOARD_SIZE);
  }


  return obj;
})();
