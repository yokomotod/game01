var Mapper = function() {

	this.initialize.apply(this, arguments);
}
Mapper.prototype = {
	initialize : function(canvas) {
		if (! canvas) {
			alert("Mapper() : undefined canvas");
			return false;
		}
		var ctx = canvas.getContext("2d");
		if (! ctx) {
			alert("Mapper() : failed to create context");
			return false;
		}
		this.ctx = ctx;
		this.canvasWidth = canvas.width;
		this.canvasHeight = canvas.height;
	},
	draw : function() {

		var xSize = game.xSize;
		var ySize = game.ySize;
		var z = game.floor;

		var xWidth = this.canvasWidth / xSize;
		var yWidth = this.canvasHeight / ySize;
		
		var map = game.map.map;
		
		var ctx = this.ctx;
		
		ctx.beginPath();

		ctx.fillStyle = "Black";
		ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

		ctx.fillStyle = "White";

		for (var y=0; y < ySize; y++) {
		for (var x=0; x < xSize; x++) {
				if (map[z][y][x] == 0) {
					ctx.fillRect(x*xWidth, (ySize-1-y)*yWidth, xWidth, yWidth);
				}
			};
		};
		
	}
}