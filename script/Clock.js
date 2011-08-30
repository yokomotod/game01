var Clock = function() {
  this.initialize.apply(this, arguments);
}

Clock.prototype = {
  initialize : function () {
    this.last = parseInt(new Date().getTime());

    this.frame = 0;
    
    this.fps = 0.0;
  },
  tick : function () {
    this.frame++;
    
    var now = parseInt(new Date().getTime());
    var diff = now - this.last;
    
    if (diff > 1000) {
      this.fps = 1000 * this.frame / diff;
      
      document.getElementById("fps").innerHTML = this.fps;

      this.frame = 0;
      this.last =  parseInt(new Date().getTime());
    }
  },
}
