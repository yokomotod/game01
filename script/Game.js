var Game = function() {
	this.initialize.apply(this, arguments);
}

Game.SCALE = 2.0;
Game.XSIZE = 4;
Game.YSIZE = 4;
Game.ZSIZE = 1;

Game.prototype = {
	initialize : function() {
		this.setupWebGL();
		this.setupMaze();
		this.setupActor();
		this.setupMapper();
		
		this.console = new Console();
		
		this.draw();	
	},
	setupWebGL : function() {
		var canvas = document.getElementById("canvas");
		initGL(canvas);
		initShaders()
		initTexture();
	
		gl.clearColor(0.0, 0.0, 1.0, 1.0);
		gl.enable(gl.DEPTH_TEST);
		
		mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
		cameraPos = [0.0, 0.0, -0.3];
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
	setupMaze : function() {
		this.xPos = 1.5;
		this.yPos = 1.5;
		this.zPos = 0.0;
		this.direction = 0;

		this.floor = 0;
		
		this.map = new MazeMap();

		this.map.walked[Math.floor(this.zPos)][Math.floor(this.yPos)][Math.floor(this.xPos)] = 1;

		this.updateFloorStatus(this.floor);
	},
	setupActor : function() {
		actorModel = new ActorModel();

		this.actor = new Actor();

		this.actors = new Array();
		
		this.actors[0] = new Actor(0, 1, 1, 0);
		this.map.actors[0][1][1][0] = this.actors[0];
		this.actorNum = 1;
		
		// var id=0;
		// for (var z=0; z<Game.ZSIZE; z++) {
		// for (var y=1; y<Game.YSIZE-1; y++) {
		// for (var x=1; x<Game.XSIZE-1; x++) {
			// if (this.map.map[z][y][x] != 0)
				// continue;
// 				
			// this.actors[id] = new Actor(id, x, y, z);
			// this.map.actors[z][y][x][id] = this.actors[id];
			// id++;
// 			
		// }
		// }
		// }
		// this.actorNum = id;
	},
	setupMapper : function() {
		var mapCanvas = document.getElementById("map");
		this.mapper = new Mapper(mapCanvas);
		this.mapDisplay = "none";
	},
	update : function() {
		this.console.write([this.actors[0].direction, this.actors[0].x, this.actors[0].y]);
		this.inputProc();
		
		for (var i=0; i < this.actorNum; i++) {
			this.actors[i].update(this.map);
		}

	},
	inputProc : function() {
		switch(gm.key) {
			case 0:
				return;
				
			// a:left
			case 65:
			case 37:
				this.turn(-1);
				break;
			// w:up
			case 87:
			case 38:
				this.movePlayer(1);
				break;
			// d:right
			case 68:
			case 39:
				this.turn(1);
				break;
			// s:down
			case 83:
			case 40:
				this.movePlayer(-1);
				break;
			// space
			case 32:
				this.toggleMapDisplay();
				break;
		}

		gm.key = 0;
	},
	movePlayer : function(d) {
		var dx = d * Math.sin(this.direction) * 0.05;
		var dy = d * Math.cos(this.direction) * 0.05;

		var pos = this.map.move(this.xPos, this.yPos, this.zPos, this.floor, dx, dy);		

		this.xPos = pos.x;
		this.yPos = pos.y;
		this.zPos = pos.z;
		
		this.floor = pos.floor;
		
		this.map.walked[pos.zCurr][pos.yCurr][pos.xCurr] = 1;
		
		var here = this.map.map[pos.zCurr][pos.yCurr][pos.xCurr];
		if (2 <= here && here <= 5 ) {
			this.map.walked[pos.zCurr+1][pos.yCurr][pos.xCurr] = 1;

		}

		if (6 <= here && here <= 9 ) {
			this.map.walked[pos.zCurr-1][pos.yCurr][pos.xCurr] = 1;

		}
		
		this.updateFloorStatus(pos.floor);
	},
	turn : function(d) {

		this.direction += d * Math.PI * 0.02;

		if(this.direction < 0)
			this.direction = 2 * Math.PI;
		else if(this.direction > 2 * Math.PI)
			this.direction = 0;

	},
	updateFloorStatus : function(floor) {
		document.getElementById("floor").innerHTML = "<p>Floor : "+(floor+1)+"</p>";		
	},
	toggleMapDisplay : function() {
		if (this.mapDisplay == "none")
			this.mapDisplay = "";
		else 
			this.mapDisplay = "none";
			
		document.getElementById("map").style.display = this.mapDisplay;
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
		mat4.translate(mvMatrix, [-this.xPos*Game.SCALE, -this.yPos*Game.SCALE, -this.zPos*Game.SCALE]);

		this.map.draw();

		for (var i=0; i < this.actorNum; i++) {
			this.actors[i].draw();
		}

		this.mapper.draw(this.map.map, this.map.walked, this.xPos, this.yPos, this.floor, this.direction);

	},
}
