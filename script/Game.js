var Game = function() {
	this.initialize.apply(this, arguments);
}

Game.SCALE = 2.0;
Game.XSIZE = 10;
Game.YSIZE = 10;
Game.ZSIZE = 5;

Game.XSTART = 1.5;
Game.YSTART = 1.5;
Game.ZSTART = 0;
Game.DIRSTART = 0;

Game.prototype = {
	initialize : function() {
		this.setupWebGL();
		this.setupMaze();
		this.setupActor();
		
		this.console = new Console();
		this.mapper = new Mapper();
		
		this.setupEventListener();
		
		this.directionY = 0;
		
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
		actor.speed = 5;
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
			
			if ((x+y)%1==0)
				continue;
				
			this.actors[i] = new Actor(x, y, z);
			this.map.actors[z][y][x][this.actors[i].id] = this.actors[i];
			i++;
			
		}
		}
		}
		this.actorNum = i;
	},
	setupEventListener : function() {
	    attachListener(G.EVENT_KEY, new KeyListener());
	    attachListener(G.EVENT_ACTOR_MOVE, new ActorMoveListener);
	    attachListener(G.EVENT_PLAYER_MOVE, new PlayerMoveListener);
	    attachListener(G.EVENT_ACTOR_COLLIDE, new ActorCollideListener);
	    attachListener(G.EVENT_ACTOR_COLLIDE_ACTOR, new ActorCollideActorListener);
	},
	update : function() {
	  if (gm.mouse.right) {
      pushEvent(new PlayerMoveEvent(this.actor, this.map, 1));	    
	  }
	  
	  this.actor.update();
	  
		for (var i=0; i < this.actorNum; i++) {
		  this.actors[i].update();
			pushEvent(new ActorMoveEvent(this.actors[i], this.map, 1));
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
				break;
			// space
			case 32:
				this.mapper.changeMode();
				break;
		}
	},
	mouseProc : function() {
	  this.turn((gm.mouse.curr.x - gm.mouse.prev.x)*-0.05);
	  this.turnY((gm.mouse.curr.y - gm.mouse.prev.y)*-0.05);
	},
	turn : function(d) {
		var direction = this.actor.direction + d * Math.PI * 0.02;

		if(direction < 0)
			direction = 2 * Math.PI;
		else if(direction > 2 * Math.PI)
			direction = 0;
			
		this.actor.direction = direction;

	},
	turnY : function(d) {
	    var direction = this.directionY + d * Math.PI * 0.02;
	
	    if(direction < 0)
	      direction = 2 * Math.PI;
	    else if(direction > 2 * Math.PI)
	      direction = 0;
	      
	    this.directionY = direction;

  },
	updateFloorStatus : function(floor) {
		document.getElementById("floor").innerHTML = "<p>Floor : "+(floor+1)+"</p>";		
	},
	updateHPStatus : function(hp) {
		document.getElementById("hp").innerHTML = "<p>HP : "+hp+"</p>";		
	},
	draw : function() {
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


	    gl.activeTexture(gl.TEXTURE0);
	    gl.bindTexture(gl.TEXTURE_2D, neheTexture);
	
	    mat4.identity(mvMatrix);
	
	    useShaderProgram(1);
		mat4.rotate(mvMatrix, degToRad(cameraRotX), [1, 0, 0]);
		mat4.rotate(mvMatrix, degToRad(cameraRotY), [0, 1, 0]);
		mat4.rotate(mvMatrix, degToRad(cameraRotZ), [0, 0, 1]);
		mat4.translate(mvMatrix, cameraPos);
	
	    mat4.rotate(mvMatrix, this.directionY, [1, 0, 0]);
		mat4.rotate(mvMatrix, this.actor.direction, [0, 0, 1]);
		mat4.translate(mvMatrix, [-this.actor.x*Game.SCALE, -this.actor.y*Game.SCALE, -this.actor.z*Game.SCALE]);
		

		this.map.draw();

		for (var i=0; i < this.actorNum; i++) {
			this.actors[i].draw();
		}

		this.mapper.draw(this.map.map, this.map.walked, this.actor.x, this.actor.y, this.actor.floor, this.actor.direction);

	},
}

var triangleVertexPositionBuffer;
var squareVertexPositionBuffer;
