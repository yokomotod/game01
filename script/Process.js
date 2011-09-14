var ProcessManager = function() {
  this.initialize.apply(this, arguments);
}

ProcessManager.prototype = {
  initialize : function() {
    this.processList = new Array();
  },
  attach : function(process) {
    this.processList.push(process);
  },
  update : function() {
    var len = this.processList.length - 1;

    for (var i=len; i >= 0; i--) {
      var process = this.processList[i];
      if (process.isDead) {
        var next = process.next;
        if (next) {
          this.attach(next);
        }
        this.processList.splice(i, 1);
      }
      else {
        process.update();      
      }
    }
  }
}
