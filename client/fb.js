var opponent = (function(g) {
  this.sendTurn = function() {
    var str = "";
    g.moveHistory.map(function(v) {
      str += v.srcX + "." + v.srcY + ":" + v.destX + "." + v.destY;
      str += v.captures ? "T" : "F";
    });
    FB.ui({method: 'apprequests',
      message: 'This is a newer message.',
      to: '1216678154',
      action_type:'turn',
      data: str
    }, function(response){
      console.log(response);
    });
  };

  this.clearEvent = function(requestId) {
    FB.api(requestId, 'delete', function(response) {
      console.log(response);
    });
  };
  return this;
}).call(this, GLOBAL);