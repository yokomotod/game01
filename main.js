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

		this.stack = new Array(this.xSize*this.ySize);
		this.numRoad = 0;
		
		this.status = 1;
		this.mark = 0;

		// while (this.make()) {
		// };

		this.map = new Array(this.xSize);
		for (var x = 0; x < this.xSize; x++) {
			this.map[x] = new Array(this.ySize);
			for (var y = 0; y < this.ySize; y++) {
				this.map[x][y] = 1; //0;
			}
		}

		while (this.make()) {
		};

		this.map[1][2] = 0;
		this.map[2][2] = 2;
		this.map[3][2] = 2;
		this.map[1][3] = 0;
		this.map[2][3] = 0;
		this.map[2][1] = 0;
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
	random: function(x) {
		return Math.floor(Math.random() * x);
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
	gocheck: function(x, y) {
		var r = 0;
		if ((x < this.xSize - 2)
		&& (this.map[x + 1][y] == 1)
		&& (this.map[x + 2][y] == 1)
		&& (this.map[x + 1][y - 1] == 1)
		&& (this.map[x + 1][y + 1] == 1)
		&& (this.map[x + 2][y - 1] == 1)
		&& (this.map[x + 2][y + 1] == 1))
			r |= 1;
			
		if ((x >= 2)
		&& (this.map[x - 1][y] == 1)
		&& (this.map[x - 2][y] == 1)
		&& (this.map[x - 1][y - 1] == 1)
		&& (this.map[x - 1][y + 1] == 1)
		&& (this.map[x - 2][y - 1] == 1)
		&& (this.map[x - 2][y + 1] == 1))
			r |= 2;
			
		if ((y < this.ySize - 2)
		&& (this.map[x][y + 1] == 1)
		&& (this.map[x][y + 2] == 1)
		&& (this.map[x - 1][y + 1] == 1)
		&& (this.map[x + 1][y + 1] == 1)
		&& (this.map[x - 1][y + 2] == 1)
		&& (this.map[x + 1][y + 2] == 1))
			r |= 4;
			
		if ((y >= 2)
		&& (this.map[x][y - 1] == 1)
		&& (this.map[x][y - 2] == 1)
		&& (this.map[x - 1][y - 1] == 1)
		&& (this.map[x + 1][y - 1] == 1)
		&& (this.map[x - 1][y - 2] == 1)
		&& (this.map[x + 1][y - 2] == 1))
			r |= 8;
			
		return r;
	},
	extend: function(x, y, c) {
		if (this.random(10) > 1) {
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
				alert("error expand("+c+")");
		}
		this.map[x][y] = 0;
		this.stack[this.numRoad] = y*this.ySize + x;
		this.numRoad++;
		}
		else {
			var dx = 0; dy = 0;
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
				alert("error expand("+c+")");
		}
		var w = Math.floor(this.random(10));
		var h = w;
		//alert("make room "+[x, y, w, h, dx]);
		
		var ix, iy;
		for (var i=0; i < w; i++) {
			ix = x+dx*i;
			if (ix < 2 || ix > this.xSize - 2) {
				w = i-1;
				// alert("overflow w "+ix);
				break;
			}
			for (var j=0; j < h; j++) {
				iy = y+dy*j;
				if (iy < 2 || iy > this.ySize - 2) {
					h = j-1;
					// alert("overflow h " +iy);
					break;
				}
				if (i==0&&j==0) continue;
				if (this.map[ix][iy] == 0){
					if (i >= j) w = i-1;
						else h = j-1;
					// alert("conflict");
					break;
				}
				// alert(ix+","+iy+" ("+w+","+h+")");
			};
		};
		w--;h--;
		if (w <= 0 || h <= 0) return [x, y];
		
		// alert("making room "+[x, y, w, h]);
		for (var i=0; i < w; i++) {
			for (var j=0; j < h; j++) {
				var ix = x+i*dx;
				var iy = y+j*dy;
				this.map[ix][iy] = 0;
				this.stack[this.numRoad] = iy*this.ySize + ix;
				this.numRoad++;
			}	
		}
		
			ty = this.random((w + h) * 2);
			tx = ty / (w + h);
			if (tx != 0) {
				ty = ty % (w + h);
				tx = ty / w;
				if (tx != 0) {
					tx = ty % w;
					ty = h - 1;
				} else {
					tx = ty % w;
					ty = 0;
				}
			} else {
				ty = ty % (w + h);
				tx = ty / w;
				if (tx != 0) {
					tx = w - 1;
					ty = ty % h;
				} else {
					tx = 0;
					ty = ty % h;
				}
			}
			x += dx*tx;
			y += dy*ty;
			if ( x < 2 || y < 2) alert(x+" ,"+y);
		}

		// return c;
		return {x: x, y: y};
	},
	step1: function() {
		var x, y;

		// for (x = 0; x < this.xSize; x++) {
			// this.map[x][0] = 0;
			// this.map[x][this.ySize - 1] = 0;
		// }
		// for (y = 0; y < this.ySize; y++) {
			// this.map[0][y] = 0;
			// this.map[this.xSize - 1][y] = 0;
		// }

		this.map[1][1] = 0;
		this.stack[this.numRoad] = 1*this.ySize + 1;
		this.numRoad++;
		
		// this.map[this.xSize - 1][this.ySize - 1] = 0;

	},
	step2: function() {
		//alert("step2()");
		var x, y;
		var d;
		
		for (var i=0; ; i++) {
		  if (i >= 10) return false;
		  
		  y = this.stack[this.random(this.numRoad)];
		  x = y % this.ySize;
		  y = (y - x) / this.ySize;
		  
		  if (this.map[x][y] == 1) alert("error stack broken");
		  
		  d = this.gocheck(x, y);
		  
		  if (d != 0) break;
		};
		//alert("chose " + x + " " + y);
		
		while (true) {

			c = this.gorand(d);
			
			//alert("d = "+d+" and chose c="+c);
			
			if (c == 1 || c == 2) n = this.random(this.xSize / 8 + 1);
			else if (c == 4 || c == 8) n = this.random(this.ySize / 8 + 1);
			else alert("error step2() first c="+c);

			flag = true;

			while (flag) {

				flag = false;
				// this.extend(x, y, c);

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
				// }
				var p = this.extend(x, y, c);
				x = p.x;
				y = p.y;
				
				d = this.gocheck(x, y);
				//alert("expanded. now (x,y)=("+x+","+y+") and d="+d+" and n="+n);
				if (d == 0)
					return true;
				if ((n-- > 0) && ((c & d) != 0))
					flag = true;
			}
			//alert("break");
		}
	},
	make: function() {
		switch (this.status) {
			case 1:
				this.step1();
				this.status = 2;
				break;
			case 2:
				if (this.step2() == false)
					this.status = 4;
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

		var n = 0;

		var steps = 8;
		var h = 1/steps;

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

		//
		// Floor and Roof
		//
		for (var x=0; x < this.xSize; x++) {
		for (var y=0; y < this.ySize; y++) {

				if (this.map[x][y] == 0) {
				
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

					vertexNormals = vertexNormals.concat([
						0.0, 0.0, 1.0,
						0.0, 0.0, 1.0,
						0.0, 0.0, 1.0,
						0.0, 0.0, 1.0,

						0.0, 0.0, -1.0,
						0.0, 0.0, -1.0,
						0.0, 0.0, -1.0,
						0.0, 0.0, -1.0,
					]);

					textureCoords = textureCoords.concat(texture);
					textureCoords = textureCoords.concat(texture); // we need concat twice

					n += 8;
				}

				// Normal Side
				if (y != this.ySize-1) {
					if ((x == 0) || (x == this.xSize-1) || (this.isWall(x-1, y) != this.isWall(x, y))) {

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

						if ((x == 0) || (this.isWall(x, y))) {
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

				// Normal Ahead
				if (x != this.xSize-1) {
					if ((y == 0) || (y == this.ySize-1) || (this.isWall(x, y-1) != this.isWall(x, y))) {
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

						var normal;
						if ((y == 0) || (this.isWall(x, y))) {
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

				if (2 <= this.map[x][y] && this.map[x][y] <= 5) {
					for (var i=0; i<steps; i++) {
						
						if (this.map[x][y] == 2 || this.map[x][y] == 3) {
							if (this.map[x][y] == 2) {
								var x0 = 0.0;
								var x1 = 1.0;
								var y0 = h*i;
								var y1 = h*(i+1);
								var y2 = 1.0						
								var z0 = h*i;
								var z1 = h*(i+1);
							}
							else {
								var x0 = 0.0;
								var x1 = 1.0;
								var x2 = 0.0;
								var y0 = 1.0 - h*i;
								var y1 = 1.0 - h*(i+1);
								var y2 = 0.0;
								var z0 = h*i;
								var z1 = h*(i+1);
							}
							vertices = vertices.concat([
							x+x0, y+y0, z0,
							x+x1, y+y0, z0,
							x+x1, y+y1, z0,
							x+x0, y+y1, z0,

							x+x0, y+y1, z0,
							x+x1, y+y1, z0,
							x+x1, y+y1, z1,
							x+x0, y+y1, z1,
							
							x+x0, y+y2, 0.0,
							x+x1, y+y2, 0.0,
							x+x1, y+y2, 1.0,
							x+x0, y+y2, 1.0,

							x+x1, y+y1, z0,
							x+x1, y+y2, z0,
							x+x1, y+y2, z1,
							x+x1, y+y1, z1,
	
							x+x0, y+y1, z0,
							x+x0, y+y2, z0,
							x+x0, y+y2, z1,
							x+x0, y+y1, z1,
							]);	
						}	
						else {
							if (this.map[x][y] == 4) {
								var x0 = h*i;
								var x1 = h*(i+1);
								var x2 = 1.0;
								var y0 = 0.0;
								var y1 = 1.0;
								var y2 = 1.0						
								var z0 = h*i;
								var z1 = h*(i+1);
							}
							else {
								var x0 = 1.0 - h*i;
								var x1 = 1.0 - h*(i+1);
								var x2 = 0.0;
								var y0 = 0.0;
								var y1 = 1.0;
								var y2 = 1.0						
								var z0 = h*i;
								var z1 = h*(i+1);
							}

							vertices = vertices.concat([
							x+x0, y+y0, z0,
							x+x0, y+y1, z0,
							x+x1, y+y1, z0,
							x+x1, y+y0, z0,

							x+x1, y+y0, z0,
							x+x1, y+y1, z0,
							x+x1, y+y1, z1,
							x+x1, y+y0, z1,
						
							x+x2, y+y0, 0.0,
							x+x2, y+y1, 0.0,
							x+x2, y+y1, 1.0,
							x+x2, y+y0, 1.0,

							x+x1, y+y1, z0,
							x+x2, y+y1, z0,
							x+x2, y+y1, z1,
							x+x1, y+y1, z1,

							x+x1, y+y0, z0,
							x+x2, y+y0, z0,
							x+x2, y+y0, z1,
							x+x1, y+y0, z1,
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

						n += 16;

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

						// textureCoords = textureCoords.concat([
						// 2.0*h*(i+1), 0.0,
						// 2.0, 0.0,
						// 2.0, 2.0*h,
						// 2.0*h*(i+1), 2.0*h,	
						// ]);
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

		this.xPos = 1.5;
		this.yPos = 1.5;
		this.zPos = 0.0;
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

		mat4.rotate(mvMatrix, this.direction, [0, 0, 1]);

		mat4.translate(mvMatrix, [-this.xPos, -this.yPos, -this.zPos]);

		this.map.draw();

	},
	move: function(d) {
		var x = this.xPos;
		var y = this.yPos;

		var dx = d*Math.sin(this.direction)*0.1;
		var dy = d*Math.cos(this.direction)*0.1;

		var xOffset = 0;
		var yOffset = 0;
		if (dx > 0) xOffset = 0.3;
			else xOffset = -0.3;
		if (dy > 0) yOffset = 0.3;
			else yOffset = -0.3;
		 
		var xCurr = Math.floor(this.xPos);
		var yCurr = Math.floor(this.yPos);
		var xNext = Math.floor(this.xPos+dx+xOffset);
		var yNext = Math.floor(this.yPos+dy+yOffset);
		
		if (this.map.map[xCurr][yCurr] == 0) {
			if (this.map.map[xNext][yCurr] == 0
				|| (this.map.map[xNext][yCurr] == 3 && dx > 0)
				|| (this.map.map[xNext][yCurr] == 4 && dx < 0) ) {
				this.xPos += dx;
			}

			if (this.map.map[xCurr][yNext] == 0
				|| (this.map.map[xCurr][yNext] == 2 && dy > 0)
				|| (this.map.map[xCurr][yNext] == 3 && dy < 0)) {
				this.yPos += dy;
			}
		}
		else {
			if (this.map.map[xNext][yCurr] == 4 || this.map.map[xNext][yCurr] == 5) {
				this.xPos += dx;
				this.zPos += dx;
			}
			else if (this.map.map[xNext][yCurr] == 2 || this.map.map[xNext][yCurr] == 3) {
				this.xPos += dx;
			}
			else if (this.map.map[xNext][yCurr] == 0) {
				if (this.map.map[xCurr][yCurr] == 4 || this.map.map[xCurr][yCurr] == 5) {
					this.xPos += dx;
					this.zPos += dx;			
				}
			}
			
			if (this.map.map[xCurr][yNext] == 2 || this.map.map[xCurr][yNext] == 3) {
				this.yPos += dy;
				this.zPos += dy;
			}
			else if (this.map.map[xCurr][yNext] == 4 || this.map.map[xCurr][yNext] == 5) {
				this.yPos += dy;
			}
			else if (this.map.map[xCurr][yNext] == 0) {
				if (this.map.map[xCurr][yCurr] == 2 || this.map.map[xCurr][yNext] == 3) {
					this.yPos += dy;
					this.zPos += dy;			
				}
			}
			
		}
		
		// if(! this.map.isWall(Math.round(x+0.3*xSign), Math.round(y+0.3*ySign))) {
			// this.xPos = x;
			// this.yPos = y;
// 
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