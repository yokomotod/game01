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
}
