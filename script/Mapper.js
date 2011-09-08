var Mapper = function() {

	this.initialize.apply(this, arguments);
}
Mapper.prototype = {
	initialize : function() {
		this.canvas = document.getElementById("map");
		if (! this.canvas) {
			alert("Mapper() : undefined canvas");
			return false;
		}
		this.ctx = this.canvas.getContext("2d");
		if (! this.ctx) {
			alert("Mapper() : failed to create context");
			return false;
		}
		
		this.mapMode = 0;
	},
	changeMode : function() {
		if (this.mapMode == 0) {
			this.mapMode = 1;
			var map = document.getElementById("map");
			map.style.display = "";
			this.canvas.width = document.defaultView.getComputedStyle(map, null).width.replace(/px/, "");
			this.canvas.height = document.defaultView.getComputedStyle(map, null).height.replace(/px/, "");
		}
		else if (this.mapMode == 1) {
			this.mapMode = 2;
			var map = document.getElementById("map");
			map.className = map.className.replace(/map/, "minimap");
			document.getElementById("map").style.display = "";
			this.canvasWidth = document.defaultView.getComputedStyle(map, null).width;
			this.canvasHeight = document.defaultView.getComputedStyle(map, null).height;
		}
		else {
			this.mapMode = 0;
			var map = document.getElementById("map");
			map.className = map.className.replace(/minimap/, "map");
			document.getElementById("map").style.display = "none";			
		}
	},
	draw : function(map, walked, xPos, yPos, zPos, direction) {
		if (this.mapMode == 0)
			return;

		var xSize = Game.XSIZE;
		var ySize = Game.YSIZE;

		var xWidth = this.canvas.width / xSize;
		var yWidth = this.canvas.height / ySize;
		

		var ctx = this.ctx;
		
		ctx.beginPath();

		ctx.fillStyle = "Black";
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

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
