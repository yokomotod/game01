var GameMaster = function() {
	this.initialize.apply(this, arguments);
}

GameMaster.prototype = {
	initialize  : function() {
		this.game = null;
		this.key = null;
	},
	loop : function() {
		this.game.update();
		this.game.draw();
	},
	newScene : function(scene) {
		switch (scene) {
			case 0:
				gm.game = new StartScene();
				break;
			case 1:
				gm.game = new Game();
				break;
		}
	},
}

var gm;

