var MazeMap = function() {
	this.initialize.apply(this, arguments);
}
MazeMap.prototype = {
	initialize: function(xSize, ySize) {
		this.xSize = xSize;
		this.ySize = ySize;

		this.data = undefined;
		this.map = undefined;

		this.numRoad = 0;
		this.pointSize = 1;
		this.status = 1;
		this.mark = 0;

		while (this.make()) {
		};

		this.map = new Array(this.xSize);
		for (var x = 0; x < this.xSize; x++) {
			this.map[x] = new Array(this.ySize);
			for (var y = 0; y < this.ySize; y++) {
				this.map[x][y] = 0;
			}
		}

		for (var x = 0; x < this.xSize; x++) {
			for (var y = 0; y < this.ySize; y++) {
				if ((this.data[x][y] & 0x1) != 0) {
					this.map[x + 1][y] = 1;
				}
				if ((this.data[x][y] & 0x2) != 0) {
					this.map[x - 1][y] = 1;
				}
				if ((this.data[x][y] & 0x4) != 0) {
					this.map[x][y + 1] = 1;
				}
				if ((this.data[x][y] & 0x8) != 0) {
					this.map[x][y - 1] = 1;
				}
			}
		}

		for (var x = 0; x < this.xSize; x++) {
			for (var y = 0; y < this.ySize; y++) {
				if (this.map[x][y] == 0) {
					this.numRoad++;
				}
			}
		}
	},
	random: function(x) {
		// return rand() % x;
		return Math.floor(Math.random() * x);
	},
	gocheck: function(x, y) {
		var r = 0;
		if ((x < this.xSize - 1) && ((this.data[x + 1][y] & 15) == 0)
		&& ((this.data[x + 2][y] & 15) == 0)
		&& ((this.data[x + 1][y - 1] & 15) == 0)
		&& ((this.data[x + 1][y + 1] & 15) == 0)
		&& ((this.data[x + 2][y - 1] & 15) == 0)
		&& ((this.data[x + 2][y + 1] & 15) == 0))
			r |= 1;
		if ((x > 0) && ((this.data[x - 1][y] & 15) == 0)
		&& ((this.data[x - 2][y] & 15) == 0)
		&& ((this.data[x - 1][y - 1] & 15) == 0)
		&& ((this.data[x - 1][y + 1] & 15) == 0)
		&& ((this.data[x - 2][y - 1] & 15) == 0)
		&& ((this.data[x - 2][y + 1] & 15) == 0))
			r |= 2;
		if ((y < this.ySize - 1) && ((this.data[x][y + 1] & 15) == 0)
		&& ((this.data[x][y + 2] & 15) == 0)
		&& ((this.data[x - 1][y + 1] & 15) == 0)
		&& ((this.data[x + 1][y + 1] & 15) == 0)
		&& ((this.data[x - 1][y + 2] & 15) == 0)
		&& ((this.data[x + 1][y + 2] & 15) == 0))
			r |= 4;
		if ((y > 0) && ((this.data[x][y - 1] & 15) == 0)
		&& ((this.data[x][y - 2] & 15) == 0)
		&& ((this.data[x - 1][y - 1] & 15) == 0)
		&& ((this.data[x + 1][y - 1] & 15) == 0)
		&& ((this.data[x - 1][y - 2] & 15) == 0)
		&& ((this.data[x + 1][y - 2] & 15) == 0))
			r |= 8;
		return r;
	},
	gorand: function(d) {
		var c, f;
		if ((d & 15) == 0)
			return 0;

		for (c = 0; c == 0;) {
			f = (1 << this.random(4));
			if ((d & f) != 0)
				c = f;
		}
		return c;
	},
	extend: function(x, y, c) {
		switch (c) {
			case 1:
				this.data[x][y] |= 1;
				x++;
				this.data[x][y] |= 2;
				return 1;
			case 2:
				this.data[x][y] |= 2;
				x--;
				this.data[x][y] |= 1;
				return 2;
			case 4:
				this.data[x][y] |= 4;
				y++;
				this.data[x][y] |= 8;
				return 4;
			case 8:
				this.data[x][y] |= 8;
				y--;
				this.data[x][y] |= 4;
				return 8;
			default:
			// fprintf(stderr, "error\n");
			// System.exit(1);
		}
		return 0;
	},
	make: function() {
		switch (this.status) {
			case 1:
				this.step1();
				this.status = 2;
				break;
			case 2:
				if (this.step2() == false)
					this.status = 3;
				break;
			case 3:
				if (this.step3() == false)
					this.status = 4;
				break;
			case 4:
				// this.step4();
				this.status = 0;
				break;
			default:
				return false;
		}
		return true;
	},
	step1: function() {
		// int c, *p, x, y;
		var x, y;

		this.data = new Array(this.xSize);
		for (x = 0; x < this.xSize; x++) {
			this.data[x] = new Array(this.ySize);
			for (y = 0; y < this.ySize; y++) {
				this.data[x][y] = 0;
			}
		}

		for (x = 1; x < this.xSize - 1; x++) {
			this.data[x][0] = (1 + 2);
			this.data[x][this.ySize - 1] = (1 + 2);
		}
		for (y = 1; y < this.ySize - 1; y++) {
			this.data[0][y] = (4 + 8);
			this.data[this.xSize - 1][y] = (4 + 8);
		}
		this.data[0][0] = (1 + 4);
		this.data[this.xSize - 1][0] = (2 + 4);
		this.data[0][this.ySize - 1] = (1 + 8);
		this.data[this.xSize - 1][this.ySize - 1] = (2 + 8);

		for (x = 0; x < this.pointSize; x++) {
			for (y = 0; y < this.pointSize; y++) {
				this.data[x][y] |= 16;
				this.data[this.xSize - 1 - x][this.ySize - 1 - y] |= 32;
			}
		}

	},
	step2: function() {
		var x, y, c, d, n, i;
		var flag;

		for (i = 0;; i++) {
			if (i >= 5)
				return false;
			y = this.random((this.xSize + this.ySize) * 2);
			x = y / (this.xSize + this.ySize);
			if (x != 0) {
				y = y % (this.xSize + this.ySize);
				x = y / this.xSize;
				if (x != 0) {
					x = y % this.xSize;
					y = this.ySize - 1;
				} else {
					x = y % this.xSize;
					y = 0;
				}
			} else {
				y = y % (this.xSize + this.ySize);
				x = y / this.xSize;
				if (x != 0) {
					x = this.xSize - 1;
					y = y % this.ySize;
				} else {
					x = 0;
					y = y % this.ySize;
				}
			}
			d = this.gocheck(x, y);
			if (d != 0)
				break;
		}

		d = this.gocheck(x, y);
		while (true) {

			flag = true;

			c = this.gorand(d);
			switch (c) {
				case 1:
				case 2:
					n = this.random(this.xSize / 8 + 1);
					break;
				case 4:
				case 8:
					n = this.random(this.ySize / 8 + 1);
					break;
				default:
					// fprintf(stderr, "error\n");
					n = 0;
					alart("error1");
				// System.exit(1);
			}

			// LOOP2:
			while (flag) {

				flag = false;
				// this.extend(x, y, c);

				switch (this.extend(x, y, c)) {
					case 1:
						x++;
						break;
					case 2:
						x--;
						break;
					case 4:
						y++;
						break;
					case 8:
						y--;
						break;
					default:
						alert("error2");
					// System.exit(1);
				}

				d = this.gocheck(x, y);
				if (d == 0)
					return true;
				if ((n-- > 0) && ((c & d) != 0))
					flag = true;

			}

		}

	},
	step3: function() {
		var x, y, c, d, n, i;
		var flag;

		for (i = 0;; i++) {
			if (i >= 100)
				return false;
			x = this.random(this.xSize);
			y = this.random(this.ySize);
			if ((this.data[x][y] & 15) == 0)
				continue;
			d = this.gocheck(x, y);
			if (d != 0)
				break;
		}

		// LOOP1:
		while (true) {

			flag = true;

			c = this.gorand(d);
			switch (c) {
				case 1:
				case 2:
					n = this.random(this.xSize / 10 + 1);
					break;
				case 4:
				case 8:
					n = this.random(this.ySize / 10 + 1);
					break;
				default:
					// fprintf(stderr, "error\n");
					n = 0;
					alert("error3");
				// System.exit(1);
			}

			// LOOP2:
			while (flag) {
				flag = false;
				// int s = this.extend(x, y, c);

				switch (this.extend(x, y, c)) {
					case 1:
						x++;
						break;
					case 2:
						x--;
						break;
					case 4:
						y++;
						break;
					case 8:
						y--;
						break;
					default:
						alert("error4");
					// System.exit(1);
				}

				d = this.gocheck(x, y);
				if (d == 0)
					return true;
				if ((n-- > 0) && ((c & d) != 0))
					flag = true;// goto LOOP2;
				// goto LOOP1;
			}
		}
	},
	step4: function() {
		var x, y, c, d, count = 1;

		while (count != 0) {
			count = 0;
			for (x = 0; x < this.xSize; x++) {
				for (y = 0; y < this.ySize; y++) {
					if ((this.data[x][y] & 15) == 0)
						continue;
					while ((d = this.gocheck(x, y)) != 0) {
						count++;
						c = this.gorand(d);
						// this.extend(x, y, c);
						switch (this.extend(x, y, c)) {
							case 1:
								x++;
								break;
							case 2:
								x--;
								break;
							case 4:
								y++;
								break;
							case 8:
								y--;
								break;
							default:
								alert("error5");
							// System.exit(1);
						}
					}
				}
			}
		}
	},
	isWall: function(x, y) {
		if (this.map[x][y] == 1) {
			return true;
		} else {
			return false;
		}
	},
	draw: function (ctx, xWidth, yWidth) {

		for (var x=0; x < this.xSize; x++) {
			for (var y=0; y < this.ySize; y++) {
				if (this.map[x][y] == 0) {
					ctx.fillStyle = "Gray";
				} else {
					ctx.fillStyle = "Black";
				}
				ctx.fillRect(x*xWidth, y*yWidth, xWidth, yWidth);
			};
		};
	}
}
var Game = function() {
	this.initialize.apply(this, arguments);
}
Game.prototype = {
	initialize: function() {
		var canvas = document.getElementById("canvas");
		if (! canvas) {
			return false;
		}
		var ctx = canvas.getContext("2d");
		if (! ctx) {
			return false;
		}
		this.ctx = ctx;

		this.key = 0;

		this.xSize = 50;
		this.ySize = 50;

		this.map = new MazeMap(this.xSize, this.ySize);
		this.xPos = 1;
		this.yPos = 1;
	},
	loop: function() {
		if (this.update()) {
			this.draw();		
		}
	},
	update: function() {
		switch(this.key) {
			case 0:
				return false;
			case 37:
				game.move(2);
				break;
			case 38:
				game.move(0);
				break;
			case 39:
				game.move(3);
				break;
			case 40:
				game.move(1);
				break;
		}

		this.key = 0;
		
		return true;
	},
	draw: function() {
		var w = 600;
		var h = 600;

		var xWidth = w / this.xSize;
		var yWidth = h / this.ySize;

		this.ctx.beginPath();

		this.map.draw(this.ctx, xWidth, yWidth);

		this.ctx.fillStyle = "Red";

		var xCenter = (this.xPos+0.5) * xWidth;
		var yCenter = (this.yPos+0.5) * yWidth;

		this.ctx.arc(xCenter, yCenter, xWidth/2, 0, Math.PI*2, false);
		this.ctx.fill();
		
	},
	move: function(d) {
		var x = this.xPos;
		var y = this.yPos;

		switch(d) {
			case 0:
				y--;
				break;
			case 1:
				y++;
				break;
			case 2:
				x--;
				break;
			case 3:
				x++;
				break;
		}
		if(! this.map.isWall(x, y)) {
			this.xPos = x;
			this.yPos = y;

			this.draw();
		}
	}
}

var game;

function keyDown(e) {
	var key = e.keyCode;
	game.key = key;
}

function main() {
	game = new Game();

	setInterval("game.loop()", 1000/60);

	document.onkeydown = keyDown;		

	game.draw();

}