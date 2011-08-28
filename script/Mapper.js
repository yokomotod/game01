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
	draw : function(map, walked, xPos, yPos, zPos, direction) {
		var xSize = Game.XSIZE;
		var ySize = Game.YSIZE;

		var xWidth = this.canvasWidth / xSize;
		var yWidth = this.canvasHeight / ySize;
		
		var ctx = this.ctx;
		
		ctx.beginPath();

		ctx.fillStyle = "Black";
		ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);


		for (var y=0; y < ySize; y++) {
		for (var x=0; x < xSize; x++) {
				if (map[zPos][y][x] == 1)
					continue;
				if (walked[zPos][y][x] != 1)
					continue;
					
				if (map[zPos][y][x] == 0) {
					ctx.fillStyle = "White";
					ctx.fillRect(x*xWidth, (ySize-1-y)*yWidth, xWidth, yWidth);
				}
				if (2 <= map[zPos][y][x] && map[zPos][y][x] <= 5) {
					ctx.fillStyle = "Yellow";
					ctx.fillRect(x*xWidth, (ySize-1-y)*yWidth, xWidth, yWidth);
				}
				if (6 <= map[zPos][y][x] && map[zPos][y][x] <= 9) {
					ctx.fillStyle = "Blue";
					ctx.fillRect(x*xWidth, (ySize-1-y)*yWidth, xWidth, yWidth);
				}
			};
		};
		
		var xCenter = xPos * xWidth;
		var yCenter = (ySize-yPos) * yWidth;

		ctx.fillStyle = "Red";
		ctx.arc(xCenter, yCenter, xWidth/2, direction+Math.PI*5/4, direction+Math.PI*7/4, false);
		ctx.fill();
	}
}
