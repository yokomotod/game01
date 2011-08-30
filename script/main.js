function main() {
	gm = new GameMaster();
	gm.loadScene("start");
	setInterval("gm.loop()", 1000 / 60);
	document.onkeydown = function(e) {
		gm.key = e.keyCode;
		
		gm.eventManager.pushEvent(new KeyEvent(e.keyCode));
	};
}