var Game = function() {
	this.initialize.apply(this, arguments);
}
Game.prototype = {
	initialize : function() {
		this.key = 0;

		this.xSize = 30;
		this.ySize = 30;
		this.zSize = 1;

		this.xPos = 1.5;
		this.yPos = 1.5;
		this.zPos = 0.0;
		this.direction = 0;

		this.map = new MazeMap(this.xSize, this.ySize, this.zSize);

		this.initModel();
	},
	loop : function() {
		this.update();
		this.draw();
	},
	update : function() {
		switch(this.key) {
			case 0:
				return false;
			case 65:
			// a:left
			case 37:
				// left
				game.turn(-1);
				break;
			case 87:
			// w:up
			case 38:
				// up
				game.move(1);
				break;
			case 68:
			// d:right
			case 39:
				// right
				game.turn(1);
				break;
			case 83:
			// s:down
			case 40:
				// down
				game.move(-1);
				break;
		}

		this.key = 0;

		return true;
	},
	initModel : function() {

		mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
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
	draw : function() {
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
	move : function(d) {
		var x = this.xPos;
		var y = this.yPos;

		var dx = d * Math.sin(this.direction) * 0.1;
		var dy = d * Math.cos(this.direction) * 0.1;

		var xOffset = 0;
		var yOffset = 0;
		if(dx > 0)
			xOffset = 0.3;
		else
			xOffset = -0.3;
		if(dy > 0)
			yOffset = 0.3;
		else
			yOffset = -0.3;

		var xCurr = Math.floor(this.xPos);
		var yCurr = Math.floor(this.yPos);
		var xNext = Math.floor(this.xPos + dx + xOffset);
		var yNext = Math.floor(this.yPos + dy + yOffset);

		if(this.map.map[yCurr][xCurr] == 0) {
			if(this.map.map[yCurr][xNext] == 0 || (this.map.map[yCurr][xNext] == 3 && dx > 0) || (this.map.map[yCurr][xNext] == 4 && dx < 0)) {
				this.xPos += dx;
			}

			if(this.map.map[yNext][xCurr] == 0 || (this.map.map[yNext][xCurr] == 2 && dy > 0) || (this.map.map[yNext][xCurr] == 3 && dy < 0)) {
				this.yPos += dy;
			}
		} else {
			if(this.map.map[yCurr][xNext] == 4 || this.map.map[yCurr][xNext] == 5) {
				this.xPos += dx;
				this.zPos += dx;
			} else if(this.map.map[yCurr][xNext] == 2 || this.map.map[yCurr][xNext] == 3) {
				this.xPos += dx;
			} else if(this.map.map[yCurr][xNext] == 0) {
				if(this.map.map[yCurr][xCurr] == 4 || this.map.map[yCurr][xCurr] == 5) {
					this.xPos += dx;
					this.zPos += dx;
				}
			}

			if(this.map.map[yNext][xCurr] == 2 || this.map.map[yxNext][Curr] == 3) {
				this.yPos += dy;
				this.zPos += dy;
			} else if(this.map.map[yNext][xCurr] == 4 || this.map.map[yNext][xCurr] == 5) {
				this.yPos += dy;
			} else if(this.map.map[yNext][xCurr] == 0) {
				if(this.map.map[yCurr][xCurr] == 2 || this.map.map[yCurr][xCurr] == 3) {
					this.yPos += dy;
					this.zPos += dy;
				}
			}

		}
	},
	turn : function(d) {

		this.direction += d * Math.PI * 0.02;

		if(this.direction < 0)
			this.direction = 2 * Math.PI;
		else if(this.direction > 2 * Math.PI)
			this.direction = 0;

	}
}