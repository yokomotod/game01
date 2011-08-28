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

		var xSize = gm.game.xSize;
		var ySize = gm.game.ySize;
		var z = gm.game.floor;

		var xWidth = this.canvasWidth / xSize;
		var yWidth = this.canvasHeight / ySize;
		
		var map = gm.game.map.map;
		var walked = gm.game.map.walked;
		
		var ctx = this.ctx;
		
		ctx.beginPath();

		ctx.fillStyle = "Black";
		ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);


		for (var y=0; y < ySize; y++) {
		for (var x=0; x < xSize; x++) {
				if (map[z][y][x] == 1)
					continue;
				if (walked[z][y][x] != 1)
					continue;
					
				if (map[z][y][x] == 0) {
					ctx.fillStyle = "White";
					ctx.fillRect(x*xWidth, (ySize-1-y)*yWidth, xWidth, yWidth);
				}
				if (2 <= map[z][y][x] && map[z][y][x] <= 5) {
					ctx.fillStyle = "Yellow";
					ctx.fillRect(x*xWidth, (ySize-1-y)*yWidth, xWidth, yWidth);
				}
				if (6 <= map[z][y][x] && map[z][y][x] <= 9) {
					ctx.fillStyle = "Blue";
					ctx.fillRect(x*xWidth, (ySize-1-y)*yWidth, xWidth, yWidth);
				}
			};
		};
		
		var xCenter = (gm.game.xPos) * xWidth;
		var yCenter = ((ySize-gm.game.yPos)) * yWidth;

		ctx.fillStyle = "Red";
		ctx.arc(xCenter, yCenter, xWidth/2, gm.game.direction+Math.PI*5/4, gm.game.direction+Math.PI*7/4, false);
		ctx.fill();
		
		
	}
}
