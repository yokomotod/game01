function main() {
  gm = new GameMaster();
  gm.loadScene("start");
  setInterval("gm.loop()", 1000 / 60);
  document.onkeydown = function(e) {
    pushEvent(new KeyEvent(e.keyCode));
  };
  document.onmousedown = function(e) {
    if (e.button == 0) {
      pushEvent(new MouseEvent({
        down : true,
        left : true,
        x : e.x,
        y : e.y
      }));      
    }
    else if (e.button == 2) {
      pushEvent(new MouseEvent({
        down : true,
        right : true,
        x : e.x,
        y : e.y
      }));      
    }
  }
  document.onmouseup = function(e) {
   if (e.button == 0) {
      pushEvent(new MouseEvent({
        up : true,
        left : true,
        x : e.x,
        y : e.y
      }));      
    }
    else if (e.button == 2) {
      pushEvent(new MouseEvent({
        up : true,
        right : true,
        x : e.x,
        y : e.y
      }));      
    }
  }
  document.onmousemove = function(e) {
    pushEvent(new MouseEvent({
      move : true,
      x : e.clientX,
      y : e.clientY
    }));
  }
  document.oncontextmenu = function(e) {
    return false;
  }
}