var logic = (function(g) {
  this.initialize = function(){
    for (var i = 0; i < g.BOARD_SIZE/2; i++){
      for (var j = 0; j < g.NUM_ROWS; j++){
        var enemy = new Piece();
        enemy.isAlly = false;
        enemy.x = ((j+1)%2) + ~~(i*2);
        enemy.y = j;
        g.board[enemy.x][enemy.y] = enemy;

        var ally = new Piece();
        ally.x = (j%2) + ~~(i*2);
        ally.y = g.BOARD_SIZE - 1 - j;
        g.board[ally.x][ally.y] = ally;
      }
    }
  };

  this.isValid = function(x, y) {
    return (x >= 0 && y >= 0 && x < g.BOARD_SIZE && y < g.BOARD_SIZE);
  };

  this.reverseMove = function(move){
    move.srcX = g.BOARD_SIZE - move.srcX;
    move.srcY = g.BOARD_SIZE - move.srcY;
    move.destX = g.BOARD_SIZE - move.destX;
    move.destY = g.BOARD_SIZE - move.destY;
  };


// testLocal should not be specified.
  this.possibleSubMoves = function(piece, testLocal) {
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
  };

  this.movePiece = function(src, dest) {
    // If it wasn't given a dest, we assume that src is of type Move
    if(!dest) {
      dest = {
        x: src.destX,
        y: src.destY
      };

      src = {
        x: src.srcX,
        y: src.srcY
      };
    }

    g.board[dest.x][dest.y] = g.board[src.x][src.y];
    g.board[src.x][src.y] = null;
    g.board[dest.x][dest.y].x = dest.x;
    g.board[dest.x][dest.y].y = dest.y;

    if(g.board[dest.x][dest.y].isAlly && dest.y === 0) {
      g.board[dest.x][dest.y].isKing = true;
    } else if(!g.board[dest.x][dest.y].isAlly && dest.y === g.BOARD_SIZE - 1) {
      g.board[dest.x][dest.y].isKing = true;
    }
  };

  this.makeFullMove = function(moves) {
    var last;
    var failure = false;
    committedMoves = [];

    for (var move in moves){
      var x = move.srcX;
      var y = move.srcY;
      if (isValid(x,y) && g.board[x][y]){
        if (_.where(possibleSubMoves(g.board[x][y], committedMoves), move).length > 0){
          // Valid move
          last = move;
          p = g.board[x][y];
          p.x = move.destX;
          p.y = move.destY;
          g.board[p.x][p.y] = p;
          g.board[x][y] = null;
          committedMoves.push(move);
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
        p = g.board[last.destX][last.destY];
        p.x = first.srcX;
        p.y = first.srcY;
        g.board[last.destX][last.destY] = null;
        g.board[p.x][p.y] = p;
      }
    } else {
      // Remove jumped pieces
      for (move in moves){
        mid = getMiddle(move);
        if (!g.board[mid.x][mid.y].isAlly){
          pieceCaptured(g.board[mid.x][mid.y]);
        }
      }
    }
    return moves;
  };

  this.pieceCaptured = function(piece){
    g.board[piece.x][piece.y] = null;
    var enemyWon = true;
    var allyWon = true;

    for (var i = g.BOARD_SIZE - 1; i >= 0; i--) {
      for (var j = g.BOARD_SIZE- 1; j >= 0; j--) {
        if (!enemyWon && !allyWon) return;
        var piece = g.board[i][j];
        if(piece) {
          if (piece.isAlly) {
            enemyWon = false;
          } else {
            allyWon = false;
          }
        }
      }
    }
    if (enemyWon) g.state = g.GameState.LOST;
    else g.state = g.GameState.WON;
    return;
  };

  this.getMiddle = function(move){
    return {
      x: (move.destX - move.srcX)/2 + move.srcX,
      y: (move.destY - move.srcY)/2 + move.srcY
    };
  };

  this.makeEnemyMove = function(moves) {
    moves.map(reverseMove);
    return makeFullMove(moves);
  };

  return this;
}).call(this, GLOBAL);
