var gm;

function keyDown(e) {
	gm.key = e.keyCode;
}

function main() {
	gm = new GameMaster();
	gm.newScene(0);
	setInterval("gm.loop()", 1000 / 60);
	document.onkeydown = keyDown;
}