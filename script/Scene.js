var ScreenNode = function() {
  this.initialize.apply(this, arguments);
}

ScreenNode.prototype = {
  initialize : function() {
    this.children = new Array();
  },
  addChild : function(kid) {
    this.children.push(kid);
  },
  removeChild : function(kid) {
    for (var i=0; i < this.children.length; i++) {
      if (this.children[i] == kid) {
        this.children.splice(i, 1);
      }
    }    
  },
  render : function() {
    for (var i=0; i < this.children.length; i++) {
      this.children[i].render();
    }
  }
}


var Scene = function() {
  this.initialize.apply(this, arguments);
}

Scene.prototype = {
  initialize : function() {
    this.root = new ScreenNode();
  },
  addChild : function(kid) {
    this.root.addChild(kid);
  },
  removeChild : function(kid) {
    this.root.removeChild(kid);
  },
  render : function() {
    this.root.render();
  },
}
