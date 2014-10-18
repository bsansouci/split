var Move = function() {
  var obj = {
    srcX: 0,
    srcY: 0,
    destX: 0,
    destY: 0,
    isFinal: true
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
