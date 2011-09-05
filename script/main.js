function main() {
  gm = new GameMaster();
  gm.loadScene("start");
  setInterval("gm.loop()", 1000 / 60);
  document.onkeydown = function(e) {
    pushEvent(new KeyEvent(e.keyCode));
  };
  document.onmousedown = function(e) {
    pushEvent(new MouseEvent({down:true, x:e.x, y:e.y}));
  }
  document.onmouseup = function(e) {
    pushEvent(new MouseEvent({up:true, x:e.x, y:e.y}));
  }
  document.onmousemove = function(e) {
    pushEvent(new MouseEvent({move:true, x:e.clientX, y:e.clientY}));
  }
}