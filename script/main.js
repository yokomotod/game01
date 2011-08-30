function main() {
	gm = new GameMaster();
	gm.loadScene("start");
	setInterval("gm.loop()", 1000 / 60);
	document.onkeydown = function(e) {
    pushEvent(new KeyEvent(e.keyCode));		
	};
}