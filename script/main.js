//var game;
var gm;
var mapper;

function keyDown(e) {
	var key = e.keyCode;
	// game.key = key;
	gm.key = e.keyCode;
}

// function mazegame() {
	// document.getElementById("main").innerHTML = 
			// '<canvas id="canvas" width="960" height="540"></canvas>' +
			// '<div id="menu" class="window">' +
			// '	<h1 style="margin:0;padding:0;padding-bottom: 5px;font-size: 20px">Game01</h1>' +
			// '	<div id="floor" style="margin:0;padding:0;padding-bottom: 5px;font-size: 20px"></div>' +
			// '	<p onclick="newScene(0)">EXIT</p>' +
			// '</div>' +
			// '<canvas id="map" class="window" width="507" height="507" style="display:none" onclick=hidemap()></div>';
// 
	// var canvas = document.getElementById("canvas");
	// initGL(canvas);
	// initShaders()
	// initTexture();
// 
	// gl.clearColor(0.0, 0.0, 1.0, 1.0);
	// gl.enable(gl.DEPTH_TEST);
// 	
	// actorModel = new ActorModel();
// 	
	// // game = new Game();
// 
	// // setInterval("game.loop()", 1000 / 60);
// 
	// var mapCanvas = document.getElementById("map");
	// mapper = new Mapper(mapCanvas);
// 	
	// // game.draw();
	// gm.draw();	
// }
function newScene(scene) {
	switch (scene) {
		case 0:
			// start();
			gm.game = new StartScene();
			break;
		case 1:
			// mazegame();
			gm.game = new Game();
			break;
	}
}
function main() {
	gm = new GameMaster();
	newScene(0);
	setInterval("gm.loop()", 1000 / 60);
	document.onkeydown = keyDown;
}