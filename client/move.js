var Move = function(srcX, srcY, destX, destY, isFinal, captures) {
  var obj = {
    srcX: srcX || 0,
    srcY: srcY || 0,
    destX: destX || 0,
    destY: destY || 0,
    isFinal: isFinal || true,
    captures: captures || false
  };
  return obj;
};
