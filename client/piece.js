var Piece = function() {
  var obj = {
    x: 0,
    y: 0,
    ally: true,
    selected: false,
    isKing: false
  };
  obj.equals = function(other){ 
    for (var p in other){
      if (p === "equals"){
        continue;
      }
      if (obj[p] !== other[p]){
        return false;
      }
    }
    return true;
  }

  return obj;
};
