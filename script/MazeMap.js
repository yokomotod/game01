var MazeMap = function() {

	this.initialize.apply(this, arguments);
}
MazeMap.prototype = {
	initialize : function(xStart, yStart, zStart) {
		this.xSize = Game.XSIZE;
		this.ySize = Game.YSIZE;
		this.zSize = Game.ZSIZE;

		this.scale = Game.SCALE;
		
		this.data = undefined;
		this.map = undefined;

		this.stack = new Array(this.xSize * this.ySize);
		this.numRoad = 0;

		this.walked;
		
		this.status = 1;
		this.mark = 0;

		// while (this.make()) {
		// };

		this.map = new Array(this.zSize);
		for(var z = 0; z < this.zSize; z++) {
			this.map[z] = new Array(this.ySize);
			for(var y = 0; y < this.ySize; y++) {
				this.map[z][y] = new Array(this.xSize);
				for(var x = 0; x < this.xSize; x++) {
					this.map[z][y][x] = 1;
					//0;
				}
			}
		}

		while(this.make(xStart, yStart, zStart)) {
		};

		this.walked = new Array(this.zSize);
		for(var z = 0; z < this.zSize; z++) {
			this.walked[z] = new Array(this.ySize);
			for(var y = 0; y < this.ySize; y++) {
				this.walked[z][y] = new Array(this.xSize);
				for(var x = 0; x < this.xSize; x++) {
					this.walked[z][y][x] = 0;
				}
			}
		}

		this.actors = new Array(this.zSize);
		for(var z = 0; z < this.zSize; z++) {
			this.actors[z] = new Array(this.ySize);
			for(var y = 0; y < this.ySize; y++) {
				this.actors[z][y] = new Array(this.xSize);
				for(var x = 0; x < this.xSize; x++) {
					this.actors[z][y][x] = {};
				}
			}
		}
		// this.map[0][2][1] = 2;
		// this.map[0][2][2] = 2;
		// this.map[0][2][3] = 2;
		// this.map[0][1][3] = 0;
		// this.map[0][2][3] = 0;
		// this.map[0][2][1] = 0;
		
		// for (var x = 0; x < this.xSize; x++) {
		// for (var y = 0; y < this.ySize; y++) {
		// if ((this.data[x][y] & 0x1) != 0) {
		// this.map[x + 1][y] = 1;
		// }
		// if ((this.data[x][y] & 0x2) != 0) {
		// this.map[x - 1][y] = 1;
		// }
		// if ((this.data[x][y] & 0x4) != 0) {
		// this.map[x][y + 1] = 1;
		// }
		// if ((this.data[x][y] & 0x8) != 0) {
		// this.map[x][y - 1] = 1;
		// }
		// }
		// }
		//
		// for (var x = 0; x < this.xSize; x++) {
		// for (var y = 0; y < this.ySize; y++) {
		// if (this.map[x][y] == 0) {
		// this.numRoad++;
		// }
		// }
		// }

		this.initModel();
	},
	random : function(x) {
		return Math.floor(Math.random() * x);
	},
	gorand : function(d) {
		var c, f;
		if((d & 15) == 0)
			return 0;

		for( c = 0; c == 0; ) {
			f = (1 << this.random(4));
			if((d & f) != 0)
				c = f;
		}
		return c;
	},
	gocheck : function(x, y, z) {
		if(x >= this.xSize - 1 || y >= this.ySize - 1)
			alert("error !!!"+[x, y, z]);
		var r = 0;
		if((x < this.xSize - 2) && (this.map[z][y][x + 1] == 1) && (this.map[z][y][x + 1] == 1) && (this.map[z][y - 1][x + 1] == 1) && (this.map[z][y + 1][x + 1] == 1) && (this.map[z][y - 1][x + 2] == 1) && (this.map[z][y + 1][x + 2] == 1))
			r |= 1;

		if((x >= 2) && (this.map[z][y][x - 1] == 1) && (this.map[z][y][x - 2] == 1) && (this.map[z][y - 1][x - 1] == 1) && (this.map[z][y + 1][x - 1] == 1) && (this.map[z][y - 1][x - 2] == 1) && (this.map[z][y + 1][x - 2] == 1))
			r |= 2;

		if((y < this.ySize - 2) && (this.map[z][y + 1][x] == 1) && (this.map[z][y + 2][x] == 1) && (this.map[z][y + 1][x - 1] == 1) && (this.map[z][y + 1][x + 1] == 1) && (this.map[z][y + 2][x - 1] == 1) && (this.map[z][y + 2][x + 1] == 1))
			r |= 4;

		if((y >= 2) && (this.map[z][y - 1][x] == 1) && (this.map[z][y - 2][x] == 1) && (this.map[z][y - 1][x - 1] == 1) && (this.map[z][y - 1][x + 1] == 1) && (this.map[z][y - 2][x - 1] == 1) && (this.map[z][y - 2][x + 1] == 1))
			r |= 8;

		return r;
	},
	extend : function(x, y, z, c) {
		flag = true;

		while(flag) {
			flag = false;

			switch (c) {
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
					alert("error expand(" + c + ")");
			}
			this.map[z][y][x] = 0;
			this.stack[this.numRoad] = {x:x, y:y, z:z};
			this.numRoad++;
			d = this.gocheck(x, y, z);
			//alert("expanded. now (x,y)=("+x+","+y+") and d="+d+" and n="+n);
			// if (d == 0)
			// 	return {result: true, x:x, y:y, d:d};
			if((n-- > 0) && ((c & d) != 0))
				flag = true;
		}

		return {
			x : x,
			y : y,
			z : z,
			d : d
		};
	},
	createRoom : function(x, y, z, c) {
		var dx = 0;
		dy = 0;
		switch (c) {
			case 1:
				dx++;
				dy++;
				break;
			case 2:
				dx--;
				dy--;
				break;
			case 4:
				dx++;
				dy++;
				break;
			case 8:
				dx--;
				dy--;
				break;
			default:
				alert("error expand(" + c + ")");
		}
		var w = Math.floor(this.random(10));
		var h = w;
		//alert("make room "+[x, y, w, h, dx]);

		var ix, iy;
		for(var i = 0; i < w; i++) {
			ix = x + dx * i;
			if(ix < 2 || ix > this.xSize - 2) {
				w = i - 1;
				// alert("overflow w "+ix);
				break;
			}
			for(var j = 0; j < h; j++) {
				iy = y + dy * j;
				if(iy < 2 || iy > this.ySize - 2) {
					h = j - 1;
					// alert("overflow h " +iy);
					break;
				}
				if(i == 0 && j == 0)
					continue;
				if(this.map[z][iy][ix] == 0) {
					if(i >= j)
						w = i - 1;
					else
						h = j - 1;
					// alert("conflict");
					break;
				}
				// alert(ix+","+iy+" ("+w+","+h+")");
			}
		}
		w--;
		h--;
		if(w <= 0 || h <= 0)
			return {
				x : x,
				y : y,
				z : z,
				d : this.gocheck(x, y, z)
			};

		// alert("making room "+[x, y, w, h]);
		for(var i = 0; i < w; i++) {
			for(var j = 0; j < h; j++) {
				var ix = x + i * dx;
				var iy = y + j * dy;
				this.map[z][iy][ix] = 0;
				this.stack[this.numRoad] = {x:ix, y:iy, z:z};
				this.numRoad++;
			}
		}
		ty = this.random((w + h) * 2);
		tx = ty / (w + h);
		if(tx != 0) {
			ty = ty % (w + h);
			tx = ty / w;
			if(tx != 0) {
				tx = ty % w;
				ty = h - 1;
			} else {
				tx = ty % w;
				ty = 0;
			}
		} else {
			ty = ty % (w + h);
			tx = ty / w;
			if(tx != 0) {
				tx = w - 1;
				ty = ty % h;
			} else {
				tx = 0;
				ty = ty % h;
			}
		}
		x += dx * tx;
		y += dy * ty;
		if(x < 2 || y < 2)
			alert(x + " ," + y);

		return {
			x : x,
			y : y,
			z : z,
			d : this.gocheck(x, y, z)
		};
	},
	staircheck : function(x, y, z, d, updown) {
		var zNext = z + updown;
		
		if (zNext < 0 || zNext >= this.zSize)
			return 0;
			
		if (this.map[zNext][y][x] != 1
			|| this.map[zNext][y][x+1] != 1
			|| this.map[zNext][y][x-1] != 1
			|| this.map[zNext][y+1][x] != 1
			|| this.map[zNext][y-1][x] != 1)
			return 0;
		
		var r = 0;
		if (this.map[z][y][x-1] == 0)
			r = 1;
		else if (this.map[z][y][x+1] == 0)
			r = 2;
		else if (this.map[z][y-1][x] == 0)
			r = 4;
		else if (this.map[z][y+1][x] == 0)
			r = 8;
		else
			return 0; //alert("staircheck error");
		
		return r & d;
		
	},
	extendUpDown : function(xCurr, yCurr, zCurr, d) {

		// alert("extendUpDown("+x+","+y+","+zCurr+")");
		
		var cUp = this.staircheck(xCurr, yCurr, zCurr, d, 1);
		var cDown = this.staircheck(xCurr, yCurr, zCurr, d, -1);
		
		if (cUp==0 && cDown==0) return {x:xCurr, y:yCurr, z:zCurr, d:d};

		var c, updown;
		
		if (cUp!=0) {
			if (cDown!= 0) {
				if (this.random(5) > 1) {
					c = cUp;
					updown = 1;
				}
				else {
					c = cDown;
					updown = -1;
				}
			}
			else {
				c = cUp;
				updown = 1;				
			}
		}
		else {
			c = cDown;
			updown = -1;			
		}
		
		var xNext = xCurr;
		var yNext = yCurr;
		var zNext = zCurr + updown;
		
		// alert("make "+[xNext, yNext, zNext]);
		if (updown == 1) {
			switch (c) {
				case 1:
					xNext = xCurr+1;
					this.map[zCurr][yCurr][xCurr] = 4;
					this.map[zNext][yCurr][xCurr] = 8;
					this.map[zNext][yCurr][xNext] = 0;
					break;
				case 2:
					xNext = xCurr-1;
					this.map[zCurr][yCurr][xCurr] = 5;
					this.map[zNext][yCurr][xCurr] = 9;
					this.map[zNext][yCurr][xNext] = 0;
					break;
				case 4:
					yNext = yCurr+1;
					this.map[zCurr][yCurr][xCurr] = 2;
					this.map[zNext][yCurr][xCurr] = 6;
					this.map[zNext][yNext][xCurr] = 0;
					break;
				case 8:
					yNext = yCurr-1;
					this.map[zCurr][yCurr][xCurr] = 3;
					this.map[zNext][yCurr][xCurr] = 7;
					this.map[zNext][yNext][xCurr] = 0;
					break;
				default:
					alert("error extendUpDown() : c = "+c);
			}
		}		
		else {
			switch (c) {
				case 1:
					xNext = xCurr+1;
					this.map[zCurr][yCurr][xCurr] = 9;
					this.map[zNext][yCurr][xCurr] = 5;
					this.map[zNext][yCurr][xNext] = 0;
					break;
				case 2:
					xNext = xCurr-1;
					this.map[zCurr][yCurr][xCurr] = 8;
					this.map[zNext][yCurr][xCurr] = 4;
					this.map[zNext][yCurr][xNext] = 0;
					break;
				case 4:
					yNext = yCurr+1;
					this.map[zCurr][yCurr][xCurr] = 7;
					this.map[zNext][yCurr][xCurr] = 3;
					this.map[zNext][yNext][xCurr] = 0;
					break;
				case 8:
					yNext = yCurr-1;
					this.map[zCurr][yCurr][xCurr] = 6;
					this.map[zNext][yCurr][xCurr] = 2;
					this.map[zNext][yNext][xCurr] = 0;
					break;
				default:
					alert("error extendUpDown() : c = "+c);
			}
		}
		//alert(this.stack[this.numRoad-1]);
		this.stack[this.numRoad-1] = {x:xNext, y:yNext, z:zNext};

		if (this.map[zNext][yNext][xNext]!=0) alert("wrong stack");
				
		return {x:xNext, y:yNext, z:zNext, d:this.gocheck(xNext, yNext, zNext)};
	},
	step1 : function(xStart, yStart, zStart) {
		// var x, y;
// 
		// for (x = 0; x < this.xSize; x++) {
		// this.map[x][0] = 0;
		// this.map[x][this.ySize - 1] = 0;
		// }
		// for (y = 0; y < this.ySize; y++) {
		// this.map[0][y] = 0;
		// this.map[this.xSize - 1][y] = 0;
		// }

		this.map[zStart][yStart][xStart] = 0;
		this.stack[this.numRoad] = {x:xStart, y:yStart, z:zStart};
		this.numRoad++;

		// this.map[this.xSize - 1][this.ySize - 1] = 0;

	},
	step2 : function() {
		//alert("step2()");
		var x, y, z;
		var d;

		z = 0;
		
		for(var i = 0; ; i++) {
			if(i >= 10)
				return false;
			var p = this.stack[this.random(this.numRoad)];
			x = p.x;
			y = p.y;
			z = p.z;

			if(this.map[z][y][x] != 0)
				alert("error stack broken : "+this.map[z][y][x]);
			d = this.gocheck(x, y, z);

			if(d != 0)
				break;
		};
		//alert("chose " + x + " " + y);

		while(true) {

			c = this.gorand(d);

			//alert("d = "+d+" and chose c="+c);

			if(c == 1 || c == 2)
				n = this.random(this.xSize / 8 + 1);
			else if(c == 4 || c == 8)
				n = this.random(this.ySize / 8 + 1);
			else
				alert("error step2() first c=" + c);

			var r;
			if(this.random(10) > 2) {
				r = this.extend(x, y, z, c);
			} else {
				r = this.createRoom(x, y, z, c);
			}
			x = r.x;
			y = r.y;
			z = r.z;
			d = r.d;

			if(d == 0)
				return true;

			if(this.random(10) < 2) {
				r = this.extendUpDown(x, y, z, d);
				x = r.x;
				y = r.y;
				z = r.z;
				d = r.d;
				if (d==0) return true;	
			}
						
		}
	},
	make : function(xStart, yStart, zStart) {
		switch (this.status) {
			case 1:
				this.step1(xStart, yStart, zStart);
				this.status = 2;
				break;
			case 2:
				if(this.step2() == false)
					this.status = 4;
				break;
			case 3:
				if(this.step3() == false)
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
	// gocheck: function(x, y) {
	// var r = 0;
	// if ((x < this.xSize - 1) && ((this.data[x + 1][y] & 15) == 0)
	// && ((this.data[x + 2][y] & 15) == 0)
	// && ((this.data[x + 1][y - 1] & 15) == 0)
	// && ((this.data[x + 1][y + 1] & 15) == 0)
	// && ((this.data[x + 2][y - 1] & 15) == 0)
	// && ((this.data[x + 2][y + 1] & 15) == 0))
	// r |= 1;
	// if ((x > 0) && ((this.data[x - 1][y] & 15) == 0)
	// && ((this.data[x - 2][y] & 15) == 0)
	// && ((this.data[x - 1][y - 1] & 15) == 0)
	// && ((this.data[x - 1][y + 1] & 15) == 0)
	// && ((this.data[x - 2][y - 1] & 15) == 0)
	// && ((this.data[x - 2][y + 1] & 15) == 0))
	// r |= 2;
	// if ((y < this.ySize - 1) && ((this.data[x][y + 1] & 15) == 0)
	// && ((this.data[x][y + 2] & 15) == 0)
	// && ((this.data[x - 1][y + 1] & 15) == 0)
	// && ((this.data[x + 1][y + 1] & 15) == 0)
	// && ((this.data[x - 1][y + 2] & 15) == 0)
	// && ((this.data[x + 1][y + 2] & 15) == 0))
	// r |= 4;
	// if ((y > 0) && ((this.data[x][y - 1] & 15) == 0)
	// && ((this.data[x][y - 2] & 15) == 0)
	// && ((this.data[x - 1][y - 1] & 15) == 0)
	// && ((this.data[x + 1][y - 1] & 15) == 0)
	// && ((this.data[x - 1][y - 2] & 15) == 0)
	// && ((this.data[x + 1][y - 2] & 15) == 0))
	// r |= 8;
	// return r;
	// },
	// gorand: function(d) {
	// var c, f;
	// if ((d & 15) == 0)
	// return 0;
	//
	// for (c = 0; c == 0;) {
	// f = (1 << this.random(4));
	// if ((d & f) != 0)
	// c = f;
	// }
	// return c;
	// },
	// extend: function(x, y, c) {
	// switch (c) {
	// case 1:
	// this.data[x][y] |= 1;
	// x++;
	// this.data[x][y] |= 2;
	// return 1;
	// case 2:
	// this.data[x][y] |= 2;
	// x--;
	// this.data[x][y] |= 1;
	// return 2;
	// case 4:
	// this.data[x][y] |= 4;
	// y++;
	// this.data[x][y] |= 8;
	// return 4;
	// case 8:
	// this.data[x][y] |= 8;
	// y--;
	// this.data[x][y] |= 4;
	// return 8;
	// default:
	// // fprintf(stderr, "error\n");
	// // System.exit(1);
	// }
	// return 0;
	// },
	// make: function() {
	// switch (this.status) {
	// case 1:
	// this.step1();
	// this.status = 2;
	// break;
	// case 2:
	// if (this.step2() == false)
	// this.status = 3;
	// break;
	// case 3:
	// if (this.step3() == false)
	// this.status = 4;
	// break;
	// case 4:
	// // this.step4();
	// this.status = 0;
	// break;
	// default:
	// return false;
	// }
	// return true;
	// },
	// step1: function() {
	// // int c, *p, x, y;
	// var x, y;
	//
	// this.data = new Array(this.xSize);
	// for (x = 0; x < this.xSize; x++) {
	// this.data[x] = new Array(this.ySize);
	// for (y = 0; y < this.ySize; y++) {
	// this.data[x][y] = 0;
	// }
	// }
	//
	// for (x = 1; x < this.xSize - 1; x++) {
	// this.data[x][0] = (1 + 2);
	// this.data[x][this.ySize - 1] = (1 + 2);
	// }
	// for (y = 1; y < this.ySize - 1; y++) {
	// this.data[0][y] = (4 + 8);
	// this.data[this.xSize - 1][y] = (4 + 8);
	// }
	// this.data[0][0] = (1 + 4);
	// this.data[this.xSize - 1][0] = (2 + 4);
	// this.data[0][this.ySize - 1] = (1 + 8);
	// this.data[this.xSize - 1][this.ySize - 1] = (2 + 8);
	//
	// for (x = 0; x < this.pointSize; x++) {
	// for (y = 0; y < this.pointSize; y++) {
	// this.data[x][y] |= 16;
	// this.data[this.xSize - 1 - x][this.ySize - 1 - y] |= 32;
	// }
	// }
	//
	// },
	// step2: function() {
	// var x, y, c, d, n, i;
	// var flag;
	//
	// for (i = 0;; i++) {
	// if (i >= 5)
	// return false;
	// y = this.random((this.xSize + this.ySize) * 2);
	// x = y / (this.xSize + this.ySize);
	// if (x != 0) {
	// y = y % (this.xSize + this.ySize);
	// x = y / this.xSize;
	// if (x != 0) {
	// x = y % this.xSize;
	// y = this.ySize - 1;
	// } else {
	// x = y % this.xSize;
	// y = 0;
	// }
	// } else {
	// y = y % (this.xSize + this.ySize);
	// x = y / this.xSize;
	// if (x != 0) {
	// x = this.xSize - 1;
	// y = y % this.ySize;
	// } else {
	// x = 0;
	// y = y % this.ySize;
	// }
	// }
	// d = this.gocheck(x, y);
	// if (d != 0)
	// break;
	// }
	//
	// d = this.gocheck(x, y);
	// while (true) {
	//
	// flag = true;
	//
	// c = this.gorand(d);
	// switch (c) {
	// case 1:
	// case 2:
	// n = this.random(this.xSize / 8 + 1);
	// break;
	// case 4:
	// case 8:
	// n = this.random(this.ySize / 8 + 1);
	// break;
	// default:
	// // fprintf(stderr, "error\n");
	// n = 0;
	// alart("error1");
	// // System.exit(1);
	// }
	//
	// // LOOP2:
	// while (flag) {
	//
	// flag = false;
	// // this.extend(x, y, c);
	//
	// switch (this.extend(x, y, c)) {
	// case 1:
	// x++;
	// break;
	// case 2:
	// x--;
	// break;
	// case 4:
	// y++;
	// break;
	// case 8:
	// y--;
	// break;
	// default:
	// alert("error2");
	// // System.exit(1);
	// }
	//
	// d = this.gocheck(x, y);
	// if (d == 0)
	// return true;
	// if ((n-- > 0) && ((c & d) != 0))
	// flag = true;
	//
	// }
	//
	// }
	//
	// },
	// step3: function() {
	// var x, y, c, d, n, i;
	// var flag;
	//
	// for (i = 0;; i++) {
	// if (i >= 100)
	// return false;
	// x = this.random(this.xSize);
	// y = this.random(this.ySize);
	// if ((this.data[x][y] & 15) == 0)
	// continue;
	// d = this.gocheck(x, y);
	// if (d != 0)
	// break;
	// }
	//
	// // LOOP1:
	// while (true) {
	//
	// flag = true;
	//
	// c = this.gorand(d);
	// switch (c) {
	// case 1:
	// case 2:
	// n = this.random(this.xSize / 10 + 1);
	// break;
	// case 4:
	// case 8:
	// n = this.random(this.ySize / 10 + 1);
	// break;
	// default:
	// // fprintf(stderr, "error\n");
	// n = 0;
	// alert("error3");
	// // System.exit(1);
	// }
	//
	// // LOOP2:
	// while (flag) {
	// flag = false;
	// // int s = this.extend(x, y, c);
	//
	// switch (this.extend(x, y, c)) {
	// case 1:
	// x++;
	// break;
	// case 2:
	// x--;
	// break;
	// case 4:
	// y++;
	// break;
	// case 8:
	// y--;
	// break;
	// default:
	// alert("error4");
	// // System.exit(1);
	// }
	//
	// d = this.gocheck(x, y);
	// if (d == 0)
	// return true;
	// if ((n-- > 0) && ((c & d) != 0))
	// flag = true;// goto LOOP2;
	// // goto LOOP1;
	// }
	// }
	// },
	// step4: function() {
	// var x, y, c, d, count = 1;
	//
	// while (count != 0) {
	// count = 0;
	// for (x = 0; x < this.xSize; x++) {
	// for (y = 0; y < this.ySize; y++) {
	// if ((this.data[x][y] & 15) == 0)
	// continue;
	// while ((d = this.gocheck(x, y)) != 0) {
	// count++;
	// c = this.gorand(d);
	// // this.extend(x, y, c);
	// switch (this.extend(x, y, c)) {
	// case 1:
	// x++;
	// break;
	// case 2:
	// x--;
	// break;
	// case 4:
	// y++;
	// break;
	// case 8:
	// y--;
	// break;
	// default:
	// alert("error5");
	// // System.exit(1);
	// }
	// }
	// }
	// }
	// }
	// },
	isWall : function(x, y, z) {
		if(x < 0 || x >= this.xSize || y < 0 || y >= this.ySize) {
			return false;
		}

		if(this.map[z][y][x] == 1) {
			return true;
		} else {
			return false;
		}
	},
	initModel: function() {

		var vertices = [];
		var vertexIndices = [];
		var textureCoords = [];
		var vertexNormals = [];

		var n = 0;

		var scale = this.scale;
		
		var steps = 8;
		var h = scale/steps;

		var texture = [
		0.0, 0.0,
		2.0, 0.0,
		2.0, 2.0,
		0.0, 2.0
		];

		var textureForStep = [
			0.0, 0.0,
			2.0, 0.0,
			2.0, 2.0*h,
			0.0, 2.0*h,
		];

		for (var iz=0; iz < this.zSize; iz++) {
		for (var iy=0; iy < this.ySize; iy++) {
		for (var ix=0; ix < this.xSize; ix++) {

			var x = ix*scale;
			var y = iy*scale;
			var z = iz*scale;
			
			//
			// Floor
			//
			if (this.map[iz][iy][ix] == 0) {
				vertices = vertices.concat([
					x,       y,       z,
					x+scale, y,       z,
					x+scale, y+scale, z,
					x,       y+scale, z,
				]);

				vertexIndices = vertexIndices.concat([
					n, n+1, n+2,
					n, n+2, n+3,
				]);

				vertexNormals = vertexNormals.concat([
					0.0, 0.0, 1.0,
					0.0, 0.0, 1.0,
					0.0, 0.0, 1.0,
					0.0, 0.0, 1.0,
				]);

				textureCoords = textureCoords.concat(texture);

				n += 4;
			}
			
			//
			// Roof
			//
			if (this.map[iz][iy][ix] == 0 || (6 <= this.map[iz][iy][ix] && this.map[iz][iy][ix] <= 9)) {
				vertices = vertices.concat([
					x,       y,       z+scale,
					x+scale, y,       z+scale,
					x+scale, y+scale, z+scale,
					x,       y+scale, z+scale,
				]);

				vertexIndices = vertexIndices.concat([
					n, n+1, n+2,
					n, n+2, n+3,
				]);

				vertexNormals = vertexNormals.concat([
					0.0, 0.0, -1.0,
					0.0, 0.0, -1.0,
					0.0, 0.0, -1.0,
					0.0, 0.0, -1.0,
				]);

				textureCoords = textureCoords.concat(texture);

				n += 4;
			}
			
			//
			// Wall : Side
			//
			// if (y != this.ySize-1) {
				// if ((x == 0) || (x == this.xSize-1) || (this.isWall(x-1, y) != this.isWall(x, y))) {
			if (ix != 0) {
				if (this.isWall(ix-1, iy, iz) != this.isWall(ix, iy, iz)) {
					vertices = vertices.concat([
						x, y,       z,
						x, y+scale, z,
						x, y+scale, z+scale,
						x, y,       z+scale,
					]);

					vertexIndices = vertexIndices.concat([
						n, n+1, n+2,
						n, n+2, n+3,
					]);

					if ((ix == 0) || (this.isWall(ix, iy, iz))) {
						vertexNormals = vertexNormals.concat([
						-1.0, 0.0, 0.0,
						-1.0, 0.0, 0.0,
						-1.0, 0.0, 0.0,
						-1.0, 0.0, 0.0,
						]);
					} else {
						vertexNormals = vertexNormals.concat([
						1.0, 0.0, 0.0,
						1.0, 0.0, 0.0,
						1.0, 0.0, 0.0,
						1.0, 0.0, 0.0,
						]);
					}

					textureCoords = textureCoords.concat(texture);

					n += 4;
				}
			}
			
			// 
			// Wall : Ahead
			//
			// if (x != this.xSize-1) {
				// if ((y == 0) || (y == this.ySize-1) || (this.isWall(x, y-1) != this.isWall(x, y))) {
			if (iy != 0) {
				if (this.isWall(ix, iy-1, iz) != this.isWall(ix, iy, iz)) {
					vertices = vertices.concat([
					x,       y, z,
					x+scale, y, z,
					x+scale, y, z+scale,
					x,       y, z+scale,
					]);

					vertexIndices = vertexIndices.concat([
					n, n+1, n+2,
					n, n+2, n+3,
					]);

					var normal;
					if ((iy == 0) || (this.isWall(ix, iy, iz))) {
						vertexNormals = vertexNormals.concat([
						0.0, -1.0, 0.0,
						0.0, -1.0, 0.0,
						0.0, -1.0, 0.0,
						0.0, -1.0, 0.0,
						]);
					} else {
						vertexNormals = vertexNormals.concat([
						0.0, 1.0, 0.0,
						0.0, 1.0, 0.0,
						0.0, 1.0, 0.0,
						0.0, 1.0, 0.0,
						]);
					}
					textureCoords = textureCoords.concat(texture);


					n += 4;
				}
			}

			//
			// Step
			//
			if (2 <= this.map[iz][iy][ix] && this.map[iz][iy][ix] <= 5) {
				for (var i=0; i<steps; i++) {
					
					if (this.map[iz][iy][ix] == 2 || this.map[iz][iy][ix] == 3) {
						if (this.map[iz][iy][ix] == 2) {
							var x0 = 0.0;
							var x1 = scale;
							var y0 = h*i;
							var y1 = h*(i+1);
							var y2 = scale;						
							var z0 = h*i;
							var z1 = h*(i+1);
						}
						else {
							var x0 = 0.0;
							var x1 = scale;
							var x2 = 0.0;
							var y0 = scale - h*i;
							var y1 = scale - h*(i+1);
							var y2 = 0.0;
							var z0 = h*i;
							var z1 = h*(i+1);
						}
						vertices = vertices.concat([
						x+x0, y+y0, z+z0,
						x+x1, y+y0, z+z0,
						x+x1, y+y1, z+z0,
						x+x0, y+y1, z+z0,

						x+x0, y+y1, z+z0,
						x+x1, y+y1, z+z0,
						x+x1, y+y1, z+z1,
						x+x0, y+y1, z+z1,
						
						x+x0, y+y2, z,
						x+x1, y+y2, z,
						x+x1, y+y2, z+scale,
						x+x0, y+y2, z+scale,

						x+x1, y+y1, z+z0,
						x+x1, y+y2, z+z0,
						x+x1, y+y2, z+z1,
						x+x1, y+y1, z+z1,

						x+x0, y+y1, z+z0,
						x+x0, y+y2, z+z0,
						x+x0, y+y2, z+z1,
						x+x0, y+y1, z+z1,
						]);	
					}	
					else {
						if (this.map[iz][iy][ix] == 4) {
							var x0 = h*i;
							var x1 = h*(i+1);
							var x2 = scale;
							var y0 = 0.0;
							var y1 = scale;
							var y2 = scale;						
							var z0 = h*i;
							var z1 = h*(i+1);
						}
						else {
							var x0 = scale - h*i;
							var x1 = scale - h*(i+1);
							var x2 = 0.0;
							var y0 = 0.0;
							var y1 = scale;
							var y2 = scale;						
							var z0 = h*i;
							var z1 = h*(i+1);
						}

						vertices = vertices.concat([
						x+x0, y+y0, z+z0,
						x+x0, y+y1, z+z0,
						x+x1, y+y1, z+z0,
						x+x1, y+y0, z+z0,

						x+x1, y+y0, z+z0,
						x+x1, y+y1, z+z0,
						x+x1, y+y1, z+z1,
						x+x1, y+y0, z+z1,
					
						x+x2, y+y0, z,
						x+x2, y+y1, z,
						x+x2, y+y1, z+scale,
						x+x2, y+y0, z+scale,

						x+x1, y+y1, z+z0,
						x+x2, y+y1, z+z0,
						x+x2, y+y1, z+z1,
						x+x1, y+y1, z+z1,

						x+x1, y+y0, z+z0,
						x+x2, y+y0, z+z0,
						x+x2, y+y0, z+z1,
						x+x1, y+y0, z+z1,
						]);	
					}

					vertexIndices = vertexIndices.concat([
					n, n+1, n+2,
					n, n+2, n+3,

					n+4, n+5, n+6,
					n+4, n+6, n+7,

					n+8, n+9, n+10,
					n+8, n+10, n+11,

					n+12, n+13, n+14,
					n+12, n+14, n+15,

					n+16, n+17, n+18,
					n+16, n+18, n+19,
					]);

					vertexNormals = vertexNormals.concat([
					0.0, 0.0, 1.0,
					0.0, 0.0, 1.0,
					0.0, 0.0, 1.0,
					0.0, 0.0, 1.0,

					0.0, 1.0, 0.0,
					0.0, 1.0, 0.0,
					0.0, 1.0, 0.0,
					0.0, 1.0, 0.0,

					0.0, 1.0, 0.0,
					0.0, 1.0, 0.0,
					0.0, 1.0, 0.0,
					0.0, 1.0, 0.0,

					1.0, 0.0, 0.0,
					1.0, 0.0, 0.0,
					1.0, 0.0, 0.0,
					1.0, 0.0, 0.0,

					-1.0, 0.0, 0.0,
					-1.0, 0.0, 0.0,
					-1.0, 0.0, 0.0,
					-1.0, 0.0, 0.0,
					]);

					n += 20;

					textureCoords = textureCoords.concat(textureForStep);
					textureCoords = textureCoords.concat(textureForStep);
					textureCoords = textureCoords.concat(texture);
		
					textureCoords = textureCoords.concat([
					2.0*h*(i+1), 2.0*h*(steps-1-i),
					2.0, 2.0*h*(steps-1-i),
					2.0, 2.0*h*(steps-i),
					2.0*h*(i+1), 2.0*h*(steps-i),	
					]);

					textureCoords = textureCoords.concat([
					2.0*h*(i+1), 2.0*h*(steps-1-i),
					2.0, 2.0*h*(steps-1-i),
					2.0, 2.0*h*(steps-i),
					2.0*h*(i+1), 2.0*h*(steps-i),	
					]);

				}
			}
		}
		}
		}

		this.model = new GLModel(GL.SHADER_TYPE_TEXTURE, vertices, vertexIndices, textureCoords, vertexNormals);
	},
	draw : function() {
    useShaderProgram(1);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureList[0]);

		this.model.draw();
	},
}