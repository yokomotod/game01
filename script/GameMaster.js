var GameMaster = function() {
	this.initialize.apply(this, arguments);
}

GameMaster.prototype = {
	initialize  : function() {
		this.game = null;
		this.key = null;	

	},
	loop : function() {
		this.update();
		this.draw();
	},
	update : function() {
		this.game.update();
	},
	draw : function() {
		this.game.draw();
	},
	newScene : function(scene) {
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
	},
}
