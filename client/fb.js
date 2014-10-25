var opponent = (function(g) {
  this.sendTurn = function() {
    var str = "";
    g.moveHistory.map(function(v) {
      str += v.srcX + "." + v.srcY + ":" + v.destX + "." + v.destY;
      str += v.captures ? "T" : "F";
    });
    FB.ui({method: 'apprequests',
      message: 'This is a newer message.',
      to: '100001439708199, 100001056938824',
      action_type:'turn',
      data: str
    }, function(response){
      console.log(response);
    });
  };
  return this;
}).call(this, GLOBAL);