var Game = function() {
	this.initialize.apply(this, arguments);
}

Game.SCALE = 2.0;
Game.XSIZE = 4;
Game.YSIZE = 4;
Game.ZSIZE = 1;

Game.XSTART = 1.5;
Game.YSTART = 1.5;
Game.ZSTART = 0;
Game.DIRSTART = 0;

Game.prototype = {
	initialize : function() {
		this.setupWebGL();
		this.setupMaze();
		this.setupActor();
		this.setupMapper();
		
		this.console = new Console();
		attachListener(G.EVENT_KEY, new KeyListener());
    attachListener(G.EVENT_ACTOR_MOVE, new ActorMoveListener);
    attachListener(G.EVENT_PLAYER_MOVE, new PlayerMoveListener);
    attachListener(G.EVENT_ACTOR_COLLIDE, new ActorCollideListener);
    attachListener(G.EVENT_ACTOR_COLLIDE_ACTOR, new ActorCollideActorListener);
		
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
		var xStart = Math.floor(Game.XSTART);
		var yStart = Math.floor(Game.YSTART);
		var zStart = Math.floor(Game.ZSTART);
		
		this.map = new MazeMap(xStart, yStart, zStart);

		this.map.walked[zStart][yStart][xStart] = 1;

		this.updateFloorStatus(zStart);
	},
	setupActor : function() {
		actorModel = new ActorModel();

		var actor = new Actor(Game.XSTART, Game.YSTART, Game.ZSTART, Game.DIRSTART);
		actor.isPlayer = true;
		this.actor = actor;
		this.map.actors[actor.floor][actor.yZone][actor.xZone][actor.id] = actor;
		
		this.updateHPStatus(this.actor.hp);
		
		this.actors = new Array();
		
		var i=0;
		for (var z=0; z<Game.ZSIZE; z++) {
		for (var y=1; y<Game.YSIZE-1; y++) {
		for (var x=1; x<Game.XSIZE-1; x++) {
			if (this.map.map[z][y][x] != 0)
				continue;
			
			if ((x+y)%2==0)
				continue;
				
			this.actors[i] = new Actor(x, y, z);
			this.map.actors[z][y][x][this.actors[i].id] = this.actors[i];
			i++;
			
		}
		}
		}
		this.actorNum = i;
	},
	setupMapper : function() {
		var mapCanvas = document.getElementById("map");
		this.mapper = new Mapper(mapCanvas);
		this.mapDisplay = "none";
	},
	update : function() {
		for (var i=0; i < this.actorNum; i++) {
			pushEvent(new ActorMoveEvent(this.actors[i], this.map.map, 1));
		}

		this.updateHPStatus(this.actor.hp);
	},
	inputProc : function(key) {
		switch(key) {
			// a:left
			case 65:
			case 37:
				this.turn(-1);
				break;
			// w:up
			case 87:
			case 38:
			  pushEvent(new PlayerMoveEvent(this.actor, this.map, 1));
				//this.movePlayer(1);
				break;
			// d:right
			case 68:
			case 39:
				this.turn(1);
				break;
			// s:down
			case 83:
			case 40:
        pushEvent(new PlayerMoveEvent(this.actor, this.map, -1));
				//this.movePlayer(-1);
				break;
			// space
			case 32:
				this.toggleMapDisplay();
				break;
		}
	},
  // movePlayer : function(d) {
    // this.actor.move(this.map, d);
//     
    // var xCurr = this.actor.xZone;
    // var yCurr = this.actor.yZone;
    // var zCurr = this.actor.floor;
//     
    // this.map.walked[zCurr][yCurr][xCurr] = 1;
//     
    // var here = this.map.map[zCurr][yCurr][xCurr];
    // if (2 <= here && here <= 5 ) {
      // this.map.walked[zCurr+1][yCurr][xCurr] = 1;
// 
    // }
// 
    // if (6 <= here && here <= 9 ) {
      // this.map.walked[zCurr-1][yCurr][xCurr] = 1;
// 
    // }
//     
    // this.updateFloorStatus(this.actor.floor);
  // },
	turn : function(d) {

		var direction = this.actor.direction + d * Math.PI * 0.02;

		if(direction < 0)
			direction = 2 * Math.PI;
		else if(direction > 2 * Math.PI)
			direction = 0;
			
		this.actor.direction = direction;

	},
	updateFloorStatus : function(floor) {
		document.getElementById("floor").innerHTML = "<p>Floor : "+(floor+1)+"</p>";		
	},
	updateHPStatus : function(hp) {
		document.getElementById("hp").innerHTML = "<p>HP : "+hp+"</p>";		
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

		mat4.rotate(mvMatrix, this.actor.direction, [0, 0, 1]);
		mat4.translate(mvMatrix, [-this.actor.x*Game.SCALE, -this.actor.y*Game.SCALE, -this.actor.z*Game.SCALE]);
		
		this.map.draw();

		for (var i=0; i < this.actorNum; i++) {
			this.actors[i].draw();
		}

		this.mapper.draw(this.map.map, this.map.walked, this.actor.x, this.actor.y, this.actor.floor, this.actor.direction);

	},
}
