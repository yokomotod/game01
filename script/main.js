function main() {
	gm = new GameMaster();
	gm.newScene(0);
	setInterval("gm.loop()", 1000 / 60);
	document.onkeydown = function(e) {
		gm.key = e.keyCode;
	};
}