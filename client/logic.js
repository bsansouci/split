var __LOGIC = __LOGIC || {};
var __DISPLAY = __DISPLAY || {};

(function(g, display, logic) {
  // Public functions
  logic.initialize = initialize;
  logic.possibleSubMoves = possibleSubMoves;
  logic.movePiece = movePiece;
  logic.getMiddle = getMiddle;
  logic.makeEnemyMoves = makeEnemyMoves;
  logic.cloneBoard = cloneBoard;
  logic.reverseMove = reverseMove;

  function initialize() {
    for (var i = 0; i < g.BOARD_SIZE/2; i++){
      for (var j = 0; j < g.NUM_ROWS; j++){
        var enemy = new Piece();
        enemy.isAlly = false;
        enemy.x = ((j+1)%2) + Math.floor(i*2);
        enemy.y = j;
        g.board[enemy.x][enemy.y] = enemy;

        var ally = new Piece();
        ally.x = (j%2) + Math.floor(i*2);
        ally.y = g.BOARD_SIZE - 1 - j;
        g.board[ally.x][ally.y] = ally;
      }
    }
  }

  function isValid(x, y) {
    return (x >= 0 && y >= 0 && x < g.BOARD_SIZE && y < g.BOARD_SIZE);
  }

  function reverseMove(move){
    move.srcX = g.BOARD_SIZE - 1 - move.srcX;
    move.srcY = g.BOARD_SIZE - 1 - move.srcY;
    move.destX = g.BOARD_SIZE - 1 - move.destX;
    move.destY = g.BOARD_SIZE - 1 - move.destY;
    return move;
  }


  // testLocal should not be specified.
  function possibleSubMoves(piece, testLocal) {
    if(!piece) return [];
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
      var m = new Move();
      m.captures = false;
      m.isFinal = true;
      m.srcX = piece.x;
      m.srcY = piece.y;
      m.destX = piece.x + xOffsets[i];
      m.destY = piece.y + yOffsets[i];

      if (!isValid(m.destX,m.destY))  continue;

      if (g.moveHistory.length > 0 || g.board[m.destX][m.destY]){
        if (!g.board[m.destX][m.destY]) continue;
        var lastMove = g.moveHistory[g.moveHistory.length-1];

        m.captures = g.board[m.destX][m.destY].isAlly !== piece.isAlly;
        m.destX += xOffsets[i];
        m.destY += yOffsets[i];

        if (lastMove && lastMove.srcX === m.destX && lastMove.srcY === m.destY) continue;
        if (!isValid(m.destX,m.destY) || g.board[m.destX][m.destY]) continue;
        // Check if next state has valid moves
        if (!testLocal) {
          var isKing = piece.isKing;
          var srcPt = {x: piece.x, y: piece.y};
          var destPt = {x: m.destX, y: m.destY};
          movePiece(srcPt, destPt);
          g.moveHistory.push(m);
          piece.isKing = isKing;
          m.isFinal = (possibleSubMoves(piece, true).length === 0);
          g.moveHistory.pop();
          movePiece(destPt, srcPt);
        } else {
          m.isFinal = false;
        }


      }

      if (_.where(g.moveHistory, m).length === 0){
        moves.push(m);
      }
    }
    return moves;
  }

  function movePiece(src, dest) {
    var move;
    // If it wasn't given a dest, we assume that src is of type Move
    if(typeof dest !== "object") {
      move = src;
      dest = {
        x: src.destX,
        y: src.destY
      };

      src = {
        x: src.srcX,
        y: src.srcY
      };
    }
    console.log("moving from", src, "to", dest);
    g.board[dest.x][dest.y] = g.board[src.x][src.y];
    g.board[src.x][src.y] = null;
    g.board[dest.x][dest.y].x = dest.x;
    g.board[dest.x][dest.y].y = dest.y;

    if(g.board[dest.x][dest.y].isAlly && dest.y === 0) {
      g.board[dest.x][dest.y].isKing = true;
    } else if(!g.board[dest.x][dest.y].isAlly && dest.y === g.BOARD_SIZE - 1) {
      g.board[dest.x][dest.y].isKing = true;
    }
    if(move && move.captures) {
      var mid = getMiddle(move);
      var captured = g.board[mid.x][mid.y];
      pieceCaptured(captured);
    }
  }

  function pieceCaptured(piece){
    g.board[piece.x][piece.y] = null;

    if (piece.isAlly) {
      g.enemyNumCaptured++;
    } else {
      g.allyNumCaptured++;
    }

    var piecesToWin = g.BOARD_SIZE * g.NUM_ROWS / 2;
    if (g.allyNumCaptured === piecesToWin){
      g.state = g.GameState.WON;
    } else if (g.enemyNumCaptured === piecesToWin){
      g.state = g.GameState.LOST;
    }
    return;
  }

  function getMiddle(move){
    return {
      x: (move.destX - move.srcX)/2 + move.srcX,
      y: (move.destY - move.srcY)/2 + move.srcY
    };
  }

  function makeEnemyMoves(moves) {
    moves.map(reverseMove).map(movePiece);
  }

  function cloneBoard(board) {
    var newBoard = new Array(board.length);

    for (var i = 0; i < board.length; i++){
      newBoard[i] = new Array(board[i].length);
      for (var j = 0; j < newBoard[i].length; j++){
        if (board[i][j]){
          var p = new Piece();
          p.x = board[i][j].x;
          p.y = board[i][j].y;
          p.isAlly = board[i][j].isAlly;
          p.isKing = board[i][j].isKing;
          newBoard[i][j] = p;
        }
      }
    }
    return newBoard;
  }

})(__GLOBAL, __DISPLAY, __LOGIC);
