
var ActorModel = function() {
	this.initialize.apply(this, arguments);
}
ActorModel.prototype = {
	initialize : function() {
		
		var size = 0.2;
		
		var vertices = [
		0.0, 0.0, 0.2,
		
		 0.2,  0.2, 0.0,
		 0.2, -0.2, 0.0,
		-0.2, -0.2, 0.0,
		-0.2,  0.2, 0.0,
		
		0.0, 0.0, -0.2
		];
		var vertexIndices = [
		0, 1, 2,
		0, 2, 3,
		0, 3, 4,
		0, 1, 4,

		5, 1, 2,
		5, 2, 3,
		5, 3, 4,
		5, 1, 4,

		
		
		];
		var textureCoords = [];
		for (var i=0; i<8; i++) {
			textureCoords = textureCoords.concat([
			0.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,
			0.0, 1.0		
			]);
		}

		var vertexNormals = [
		1.0, 0.0, 0.0,
		0.0,-1.0, 0.0,
		-1.0, 0.0, 0.0,
		0.0, 1.0, 0.0,

		1.0, 0.0, 0.0,
		0.0,-1.0, 0.0,
		-1.0, 0.0, 0.0,
		0.0, 1.0, 0.0,
		
		];
		
		this.model = new GLModel(vertices, vertexIndices, textureCoords, vertexNormals);
		this.size = size;
	},
	draw : function(x, y, z) {
		mvPushMatrix();
		mat4.translate(mvMatrix, [x*Game.SCALE, y*Game.SCALE, z*Game.SCALE+0.3]);
		mat4.rotate(mvMatrix, degToRad(45), [0, 0, 1]);

		this.model.draw();
		
		mvPopMatrix();
	}
}

var actorModel;

var Actor = function () {
	this.initialize.apply(this, arguments);
}


Actor.prototype = {
	nextId : 0,
	
	initialize : function(x, y, z, direction) {
		this.id = this.nextId;
		Actor.prototype.nextId++;
		
		this.x = x;
		this.y = y;
		this.z = z;
		
		if(direction == undefined) {
			this.direction = Math.random()*Math.PI*2;			
		}
		else {
			this.direction = direction;
		}

		this.xZone = Math.floor(this.x);
		this.yZone = Math.floor(this.y);
		
		this.floor = Math.floor(this.z);
		
		this.hp = 200;
	},
	update : function(map) {
	},
	moveCheck : function (map, sign) {

    var x = this.x;
    var y = this.y;
    var z = this.z;
    
    var floor = this.floor;
    	  
    var d = sign * 0.01;
    
    var dx = d*Math.sin(this.direction);
    var dy = d*Math.cos(this.direction);
    
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

    var xCurr = Math.floor(x);
    var yCurr = Math.floor(y);
    var zCurr = Math.floor(z);
    var xNext = Math.floor(x + dx + xOffset);
    var yNext = Math.floor(y + dy + yOffset);

    if(map[zCurr][yCurr][xCurr] == 0) {
      if(map[zCurr][yCurr][xNext] == 0
        || (map[zCurr][yCurr][xNext] == 4 && dx > 0)
        || (map[zCurr][yCurr][xNext] == 5 && dx < 0)
        || (6 <= map[zCurr][yCurr][xNext] && map[zCurr][yCurr][xNext] <= 9 )) {
        x += dx;
      }
      else {
        pushEvent(new ActorCollideEvent(this));
      }

      if(map[zCurr][yNext][xCurr] == 0
        || (map[zCurr][yNext][xCurr] == 2 && dy > 0)
        || (map[zCurr][yNext][xCurr] == 3 && dy < 0)
        || (6 <= map[zCurr][yNext][xCurr] && map[zCurr][yNext][xCurr] <= 9)) {
        y += dy;
      }
      else {
        pushEvent(new ActorCollideEvent(this));
      }
    } else if(map[zCurr][yCurr][xCurr] == 4) {
      x += dx;
      z += dx;

      if(map[zCurr][yNext][xCurr] != 1) {
        y += dy;        
      }     
      else {
        pushEvent(new ActorCollideEvent(this));
      }

      if(z < floor)
        z = floor;      
      if(Math.floor(x) > xCurr) {
        floor++;
        z = floor;
      }
    } else if(map[zCurr][yCurr][xCurr] == 5) {
      x += dx;
      z -= dx;

      if(map[zCurr][yNext][xCurr] != 1) {
        y += dy;        
      }
      else {
        pushEvent(new ActorCollideEvent(this));
      }

      if(z < floor)
        z = floor;      
      if(Math.floor(x) < xCurr) {
        floor++;
        z = floor;
      }
    } else if(map[zCurr][yCurr][xCurr] == 2) {
      y += dy;
      z += dy;

      if(map[zCurr][yCurr][xNext] != 1) {
        x += dx;        
      }     
      else {
        pushEvent(new ActorCollideEvent(this));
      }

      if(z < floor)
        z = floor;      
      if(Math.floor(y) > yCurr) {
        floor++;
        z = floor;
      }
    } else if(map[zCurr][yCurr][xCurr] == 3) {
      y += dy;
      z -= dy;      

      if(map[zCurr][yCurr][xNext] != 1) {
        x += dx;        
      }     
      else {
        pushEvent(new ActorCollideEvent(this));
      }

      if(z < floor)
        z = floor;      
      if(Math.floor(y) < yCurr) {
        floor++;
        z = floor;
      }
    } else if(6 <= map[zCurr][yCurr][xCurr] && map[zCurr][yCurr][xCurr] <= 9) {
      floor--;
      z -= 0.01;
    }
    
    return {x:x, y:y, z:z, xCurr:xCurr, yCurr:yCurr, zCurr:zCurr, floor:floor};
	},
	move : function(map, sign) {
				
		var pos = this.moveCheck(map, sign);

		for(var id in gm.game.map.actors[Math.floor(pos.z)][Math.floor(pos.y)][Math.floor(pos.x)]) {
			if(this.id == id)
				continue;
			
			var a = gm.game.map.actors[Math.floor(pos.z)][Math.floor(pos.y)][Math.floor(pos.x)][id];
			if((pos.x - a.x)*(pos.x - a.x) + (pos.y - a.y)*(pos.y - a.y) + (pos.z - a.z)*(pos.z - a.z) < 0.1){
			  pushEvent(new ActorCollideActorEvent(this, a));
				return true;
			}
		}
		
		delete gm.game.map.actors[Math.floor(this.z)][Math.floor(this.y)][Math.floor(this.x)][this.id];
		gm.game.map.actors[Math.floor(pos.z)][Math.floor(pos.y)][Math.floor(pos.x)][this.id] = this;
		
		this.x = pos.x;
		this.y = pos.y;
		this.z = pos.z;
		
		this.xZone = Math.floor(this.x);
		this.yZone = Math.floor(this.y);
		
		this.floor = Math.floor(this.z);
		
		return pos.collided;
	},
	collide : function () {
    this.direction += Math.PI*2/3 * (1 + Math.random());
    this.direction = this.direction % Math.PI*2;
	},
	collideOther : function (other) {
    gm.game.console.write(this.id+"の攻撃！"+other.id+"に１５のダメージ！");
    other.hp -= 15;   
	},
  movePlayer : function(map) {
    var xCurr = this.xZone;
    var yCurr = this.yZone;
    var zCurr = this.floor;
    
    map.walked[zCurr][yCurr][xCurr] = 1;
    
    var here = map.map[zCurr][yCurr][xCurr];
    if (2 <= here && here <= 5 ) {
      map.walked[zCurr+1][yCurr][xCurr] = 1;

    }

    if (6 <= here && here <= 9 ) {
      map.walked[zCurr-1][yCurr][xCurr] = 1;

    }
    
    gm.game.updateFloorStatus(this.floor);
  },
	draw : function() {
		actorModel.draw(this.x, this.y, this.z);
	},
}
