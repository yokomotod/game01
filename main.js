var gl;

function initGL(canvas) {
	try {
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry :-(");
	}
}

function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

var shaderProgram;

function initShaders() {
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
	gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

function mvPushMatrix() {
	var copy = mat4.create();
	mat4.set(mvMatrix, copy);
	mvMatrixStack.push(copy);
}

function mvPopMatrix() {
	if (mvMatrixStack.length == 0) {
		throw "Invalid popMatrix!";
	}
	mvMatrix = mvMatrixStack.pop();
}

function setMatrixUniforms() {
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function degToRad(degrees) {
	return degrees * Math.PI / 180;
}

var cubeVertexPositionBuffer;
var cubeVertexColorBuffer;
var cubeVertexIndexBuffer;

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

		this.initBuffers();
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
	initBuffers: function() {
		cubeVertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
		vertices = [
		// Front face
		-0.5, -0.5,  0.5,
		0.5, -0.5,  0.5,
		0.5,  0.5,  0.5,
		-0.5,  0.5,  0.5,

		// Back face
		-0.5, -0.5, -0.5,
		-0.5,  0.5, -0.5,
		0.5,  0.5, -0.5,
		0.5, -0.5, -0.5,

		// Top face
		-0.5,  0.5, -0.5,
		-0.5,  0.5,  0.5,
		0.5,  0.5,  0.5,
		0.5,  0.5, -0.5,

		// Bottom face
		-0.5, -0.5, -0.5,
		0.5, -0.5, -0.5,
		0.5, -0.5,  0.5,
		-0.5, -0.5,  0.5,

		// Right face
		0.5, -0.5, -0.5,
		0.5,  0.5, -0.5,
		0.5,  0.5,  0.5,
		0.5, -0.5,  0.5,

		// Left face
		-0.5, -0.5, -0.5,
		-0.5, -0.5,  0.5,
		-0.5,  0.5,  0.5,
		-0.5,  0.5, -0.5
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		cubeVertexPositionBuffer.itemSize = 3;
		cubeVertexPositionBuffer.numItems = 24;

		cubeVertexColorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
		var unpackedColors = [];
		for (var i=0; i < 24; i++) {
			unpackedColors = unpackedColors.concat([0.5, 0.5, 0.5, 1.0]);
		}
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
		cubeVertexColorBuffer.itemSize = 4;
		cubeVertexColorBuffer.numItems = 24;

		cubeVertexIndexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
		var cubeVertexIndices = [
		0, 1, 2,      0, 2, 3,    // Front face
		4, 5, 6,      4, 6, 7,    // Back face
		8, 9, 10,     8, 10, 11,  // Top face
		12, 13, 14,   12, 14, 15, // Bottom face
		16, 17, 18,   16, 18, 19, // Right face
		20, 21, 22,   20, 22, 23  // Left face
		];
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
		cubeVertexIndexBuffer.itemSize = 1;
		cubeVertexIndexBuffer.numItems = 36;

		// cubeLineColorBuffer = gl.createBuffer();
		// gl.bindBuffer(gl.ARRAY_BUFFER, cubeLineColorBuffer);
		// colors = []
		// for (var i=0; i < 24; i++) {
		// colors = colors.concat([0.0, 0.0, 0.0, 1.0]);
		// }
		// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
		// cubeLineColorBuffer.itemSize = 4;
		// cubeLineColorBuffer.numItems = 24;
		//
		// cubeLineIndexBuffer = gl.createBuffer();
		// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeLineIndexBuffer);
		// var cubeLineIndices = [
		// 0, 1,
		// 1, 2,
		// 2, 3,
		// 3, 0,
		// 4, 5,
		// 5, 6,
		// 6, 7,
		// 7, 4,
		// 0, 4,
		// 1, 7,
		// 2, 6,
		// 3, 5
		// ];
		// gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeLineIndices), gl.STATIC_DRAW);
		// cubeLineIndexBuffer.itemSize = 1;
		// cubeLineIndexBuffer.numItems = 24;
	},
	draw: function () {

		// for (var x=0; x < this.xSize; x++) {
		// for (var y=0; y < this.ySize; y++) {
		// if (this.map[x][y] == 1) {
		// mvPushMatrix();
		//
		// mat4.translate(mvMatrix, [x, y, 0]);

		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
		setMatrixUniforms();
		gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

		// gl.bindBuffer(gl.ARRAY_BUFFER, cubeLineColorBuffer);
		// gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeLineColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
		//
		// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeLineIndexBuffer);
		// gl.drawElements(gl.LINES, cubeLineIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

		// mvPopMatrix();
		// } else {
		// }
		// };
		// };

		// for (var x=0; x < this.xSize; x++) {
		// for (var y=0; y < this.ySize; y++) {
		// if (this.map[x][y] == 0) {
		// ctx.fillStyle = "Gray";
		// } else {
		// ctx.fillStyle = "Black";
		// }
		// ctx.fillRect(x*xWidth, y*yWidth, xWidth, yWidth);
		// };
		// };
	}
}
var Game = function() {
	this.initialize.apply(this, arguments);
}
Game.prototype = {
	initialize: function() {
		// var canvas = document.getElementById("canvas");
		// if (! canvas) {
		// return false;
		// }
		// var ctx = canvas.getContext("2d");
		// if (! ctx) {
		// return false;
		// }
		// this.ctx = ctx;
		//
		this.key = 0;

		this.xSize = 30;
		this.ySize = 30;

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
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

		mat4.identity(mvMatrix);

		mat4.translate(mvMatrix, [0, 0, -10.0]);
		mat4.rotate(mvMatrix, degToRad(150), [1, 0, 0]);
		mat4.translate(mvMatrix, [-this.xPos, -this.yPos, 0]);

		// var w = 600;
		// var h = 600;
		//
		// var xWidth = w / this.xSize;
		// var yWidth = h / this.ySize;
		//
		// this.ctx.beginPath();
		//
		// this.map.draw(this.ctx, xWidth, yWidth);
		//
		// this.ctx.fillStyle = "Red";
		//
		// var xCenter = (this.xPos+0.5) * xWidth;
		// var yCenter = (this.yPos+0.5) * yWidth;
		//
		// this.ctx.arc(xCenter, yCenter, xWidth/2, 0, Math.PI*2, false);
		// this.ctx.fill();

		this.map.draw();

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
	var canvas = document.getElementById("canvas");
	initGL(canvas);
	initShaders()
	// initBuffers();

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	// disable original tick()
	// tick();

	game = new Game();

	setInterval("game.loop()", 1000/60);

	document.onkeydown = keyDown;

	game.draw();

}