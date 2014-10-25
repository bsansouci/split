var otherPlay = (function() {
  this.sendTurn = function() {
    var str = "";
    g.moveHistory.map(function(v) {
      str += v.srcX + "." + v.srcY + ":" + v.destX + "." + v.destY;
      str += v.captures ? "T" : "F";
    });
    FB.ui({method: 'apprequests',
      message: 'Yo bing.',
      to: '100001439708199, 100001056938824',
      action_type:'turn',
      data: str
    }, function(response){
      console.log(response);
    });
  };
  return this;
})();