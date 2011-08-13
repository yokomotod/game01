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

	shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
	gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

	shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
	gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
	shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
	shaderProgram.materialShininessUniform = gl.getUniformLocation(shaderProgram, "uMaterialShininess");
	shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
	shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shaderProgram, "uPointLightingLocation");
	// shaderProgram.pointLightingColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingColor");
	shaderProgram.pointLightingSpecularColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingSpecularColor");
	shaderProgram.pointLightingDiffuseColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingDiffuseColor");

}

var neheTexture;
function initTexture() {
	neheTexture = gl.createTexture();
  	neheTexture.image = new Image();
	neheTexture.image.onload = function () {
		if (neheTexture.image == null) {
			alert("can't open image");w
		}
		handleLoadedTexture(neheTexture);
	}

	// var reader = new FileReader();
// 
	// reader.onload = function(e) {
			// neheTexture.image.src = e.target.result;
	// }
// 
	// // Read in the image file as a data URL.
	// reader.readAsDataURL("bric.png");
  
	// neheTexture.image.src = "crate.gif";
	neheTexture.image.src = "bric.png";
}

function handleLoadedTexture(texture) {

	gl.bindTexture(gl.TEXTURE_2D, texture);

	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);

	gl.generateMipmap(gl.TEXTURE_2D);

	gl.bindTexture(gl.TEXTURE_2D, null);

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

	var normalMatrix = mat3.create();
	mat4.toInverseMat3(mvMatrix,normalMatrix);
	mat3.transpose(normalMatrix);
	gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);

}

function degToRad(degrees) {
	return degrees * Math.PI / 180;
}

var GLModel = function() {
	this.initialize.apply(this, arguments);
}
GLModel.prototype = {
	initialize: function(vertices, vertexIndecies, textureCoods, vertexNormals) {

		this.modelPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.modelPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		this.modelPositionBuffer.itemSize = 3;
		this.modelPositionBuffer.numItems = vertices.length/3;

		this.modelIndexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.modelIndexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndecies), gl.STATIC_DRAW);
		this.modelIndexBuffer.itemSize = 1;
		this.modelIndexBuffer.numItems = vertexIndecies.length;

		this.modelVertexNormalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.modelVertexNormalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
		this.modelVertexNormalBuffer.itemSize = 3;
		this.modelVertexNormalBuffer.numItems = vertexNormals.length/3;

		this.modelTextureCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.modelTextureCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoods), gl.STATIC_DRAW);
		this.modelTextureCoordBuffer.itemSize = 2;
		this.modelTextureCoordBuffer.numItems = textureCoods.length/2;
	},
	draw: function() {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.modelPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.modelPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.modelVertexNormalBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, this.modelVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.modelTextureCoordBuffer);
		gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.modelTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.modelIndexBuffer);
		setMatrixUniforms();
		gl.drawElements(gl.TRIANGLES, this.modelIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}
}
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

		this.initModel();
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
		if (x < 0 || x >= this.xSize || y < 0 || y >= this.ySize) {
			return false;
		}

		if (this.map[x][y] == 1) {
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

		texture = [
		0.0, 0.0,
		2.0, 0.0,
		2.0, 2.0,
		0.0, 2.0
		];

		var n = 0;

		//
		// Floor and Roof
		//
		for (var x=0; x < this.xSize; x++) {
			for (var y=0; y < this.ySize; y++) {

				if (this.isWall(x, y)) continue;
				
				var normal = [
				0.0, 0.0, 1.0,
				0.0, 0.0, 1.0,
				0.0, 0.0, 1.0,
				0.0, 0.0, 1.0,

				0.0, 0.0, -1.0,
				0.0, 0.0, -1.0,
				0.0, 0.0, -1.0,
				0.0, 0.0, -1.0,
				];

				vertices = vertices.concat([
				x,     y,     0.0,
				x+1.0, y,     0.0,
				x+1.0, y+1.0, 0.0,
				x,     y+1.0, 0.0,

				x,     y,     1.0,
				x+1.0, y,     1.0,
				x+1.0, y+1.0, 1.0,
				x,     y+1.0, 1.0,
				]);

				vertexIndices = vertexIndices.concat([
				n, n+1, n+2,
				n, n+2, n+3,

				n+4, n+5, n+6,
				n+4, n+6, n+7,
				]);

				textureCoords = textureCoords.concat(texture);
				textureCoords = textureCoords.concat(texture); // we need concat twice
				vertexNormals = vertexNormals.concat(normal);

				n += 8;
			}
		}

		//
		// Wall
		//
		for (var x=0; x <= this.xSize; x++) {
			for (var y=0; y <= this.ySize; y++) {

				// Normal Side
				if (y != this.ySize) {
					if ((x == 0) || (x == this.xSize) || (this.isWall(x-1, y) != this.isWall(x, y))) {

						vertices = vertices.concat([
						x, y,     0.0,
						x, y+1.0, 0.0,
						x, y+1.0, 1.0,
						x, y,     1.0,
						]);

						vertexIndices = vertexIndices.concat([
						n, n+1, n+2,
						n, n+2, n+3,
						]);

						textureCoords = textureCoords.concat(texture);

						var normal;
						if ((x == 0) || (this.isWall(x, y))) {
							normal = [
							-1.0, 0.0, 0.0,
							-1.0, 0.0, 0.0,
							-1.0, 0.0, 0.0,
							-1.0, 0.0, 0.0,
							];
						} else {
							normal = [
							1.0, 0.0, 0.0,
							1.0, 0.0, 0.0,
							1.0, 0.0, 0.0,
							1.0, 0.0, 0.0,
							];
						}
						vertexNormals = vertexNormals.concat(normal);

						n += 4;
					}
				}

				// Normal Ahead
				if (x != this.xSize) {
					if ((y == 0) || (y == this.ySize) || (this.isWall(x, y-1) != this.isWall(x, y))) {
						vertices = vertices.concat([
						x,     y, 0.0,
						x+1.0, y, 0.0,
						x+1.0, y, 1.0,
						x,     y, 1.0,
						]);

						vertexIndices = vertexIndices.concat([
						n, n+1, n+2,
						n, n+2, n+3,
						]);

						textureCoords = textureCoords.concat(texture);

						var normal;
						if ((y == 0) || (this.isWall(x, y))) {
							normal = [
							0.0, -1.0, 0.0,
							0.0, -1.0, 0.0,
							0.0, -1.0, 0.0,
							0.0, -1.0, 0.0,
							];
						} else {
							normal = [
							0.0, 1.0, 0.0,
							0.0, 1.0, 0.0,
							0.0, 1.0, 0.0,
							0.0, 1.0, 0.0,
							];
						}
						vertexNormals = vertexNormals.concat(normal);

						n += 4;
					}
				}

			}
		}
		this.model = new GLModel(vertices, vertexIndices, textureCoords, vertexNormals);
	},
	draw: function () {
		this.model.draw();
	}
}

var cameraPos, cameraRotX, cameraRotY, cameraRotZ;

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
		this.ySize = 30	;

		this.xPos = 1;
		this.yPos = 1;
		this.direction = 0;
		
		this.map = new MazeMap(this.xSize, this.ySize);

		this.initModel();
	},
	loop: function() {
		// if (this.update()) {
		// this.draw();
		// }
		this.update();
		this.draw();
	},
	update: function() {
		switch(this.key) {
			case 0: 
				return false;
			case 37: // left
				game.turn(-1);
				break;
			case 38: // up
				game.move(1);
				break;
			case 39: // right
				game.turn(1);
				break;
			case 40: // down
				game.move(-1);
				break;
		}

		this.key = 0;

		return true;
	},
	initModel: function() {

		var vertices = [
		0.0, 0.0, 0.01,
		1.0, 0.0, 0.01,
		1.0, 1.0, 0.01,
		0.0, 1.0, 0.01,
		];
		var vertexIndices = [0, 1, 2,   0, 3, 2];

		var textureCoords = [
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0
		];

		var vertexNormals = [
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0
		];

		this.model = new GLModel(vertices, vertexIndices, textureCoords, vertexNormals);

		mat4.perspective(60, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

		cameraPos = [0.0, 0.0, -0.5];
		cameraRotX = -90;
		cameraRotY = 0;
		cameraRotZ = 0;
		
		mat4.identity(mvMatrix);

		mat4.rotate(mvMatrix, degToRad(cameraRotX), [1, 0, 0]);
		mat4.rotate(mvMatrix, degToRad(cameraRotY), [0, 1, 0]);
		mat4.rotate(mvMatrix, degToRad(cameraRotZ), [0, 0, 1]);
		mat4.translate(mvMatrix, cameraPos);

		gl.uniform1i(shaderProgram.samplerUniform, 0);

		var vCamera = mat4.multiplyVec3(mvMatrix, [0.0, 0.3, 0.5]);
		
		gl.uniform1f(shaderProgram.materialShininessUniform, 1.0);

		gl.uniform3f(shaderProgram.ambientColorUniform, 0.6, 0.6, 0.6);
		gl.uniform3f(shaderProgram.pointLightingSpecularColorUniform, 0.8, 0.8, 0.8);
		gl.uniform3f(shaderProgram.pointLightingDiffuseColorUniform, 0.8, 0.8, 0.8);

		gl.uniform3f(shaderProgram.pointLightingLocationUniform, vCamera[0], vCamera[1], vCamera[2]);

		gl.uniform3f(shaderProgram.pointLightingColorUniform, 1.0, 1.0, 1.0);

	},
	draw: function() {
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, neheTexture);

		mat4.identity(mvMatrix);

		mat4.rotate(mvMatrix, degToRad(cameraRotX), [1, 0, 0]);
		mat4.rotate(mvMatrix, degToRad(cameraRotY), [0, 1, 0]);
		mat4.rotate(mvMatrix, degToRad(cameraRotZ), [0, 0, 1]);
		mat4.translate(mvMatrix, cameraPos);

		// switch(this.direction) {
			// case 0: // forward
				// mat4.rotate(mvMatrix, degToRad(0), [0, 0, 1]);
				// break;
			// case 1: // right
				// mat4.rotate(mvMatrix, degToRad(90), [0, 0, 1]);
				// break;
			// case 2: // backward
				// mat4.rotate(mvMatrix, degToRad(180), [0, 0, 1]);
				// break;
			// case 3: // left
				// mat4.rotate(mvMatrix, degToRad(-90), [0, 0, 1]);
				// break;
		// }
		mat4.rotate(mvMatrix, this.direction, [0, 0, 1]);

		mat4.translate(mvMatrix, [-0.5, -0.5, 0.0]);

		this.model.draw();

		mat4.translate(mvMatrix, [-this.xPos, -this.yPos, 0]);

		this.map.draw();

	},
	move: function(d) {
		var x = this.xPos;
		var y = this.yPos;

		// switch(this.direction) {
			// case 0: // forward
				// y+=d;
				// break;
			// case 1: // right
				// x+=d;// x--;
				// break;
			// case 2: // backward
				// y-=d;
				// break;
			// case 3: // left
				// x-=d;// x++;
				// break;
		// }
		var dx = d*Math.sin(this.direction)*0.1;
		var dy = d*Math.cos(this.direction)*0.1;
		x += dx;
		y += dy;
		var xSign = dx >= 0 ? 1 : -1;
		var ySign = dy >= 0 ? 1 : -1;
		
		if(! this.map.isWall(Math.round(x+0.3*xSign), Math.round(y+0.3*ySign))) {
			this.xPos = x;
			this.yPos = y;

			this.draw();
		}
	},
	turn: function(d) {
		
		this.direction += d*Math.PI*0.02;
		
		if(this.direction < 0)
			this.direction = 2*Math.PI;
		else if(this.direction > 2*Math.PI)
			this.direction = 0;
			
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
	initTexture();
	// initBuffers();

	gl.clearColor(0.0, 0.0, 1.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	// disable original tick()
	// tick();

	game = new Game();

	setInterval("game.loop()", 1000/60);

	document.onkeydown = keyDown;

	game.draw();

}