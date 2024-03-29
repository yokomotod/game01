
var ActorModel = function() {
	this.initialize.apply(this, arguments);
}
ActorModel.prototype = {
	initialize : function() {
		
    var size = 0.2;

    var vertices = [
       size,  size,  0.0,
      -size,  size,  0.0,
       size, -size,  0.0,
      -size, -size,  0.0
    ];
    
    var vertexIndices = [
      0, 1, 2,
      0, 2, 3,
    ];
    
    var textureCoords = [
      // Front face
      0.0, 1.0,
      1.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,
    ];

    var vertexNormals = [
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
    ];

    this.model = new GLSpriteModel(2, vertices, textureCoords);
    this.size = size;
    
		// var size = 0.2;
// 		
		// var vertices = [
 		 // 0.0, 0.0,  0.2,		
		 // 0.2,  0.2, 0.0,
		 // 0.2, -0.2, 0.0,
// 
     // 0.0, 0.0,  0.2,
     // 0.2, -0.2, 0.0,
		// -0.2, -0.2, 0.0,
// 
     // 0.0, 0.0,  0.2,
    // -0.2, -0.2, 0.0,
		// -0.2,  0.2, 0.0,
// 
     // 0.0, 0.0,  0.2,   
    // -0.2,  0.2, 0.0,
     // 0.2,  0.2, 0.0,
// 		
// 
     // 0.0, 0.0, -0.2,   
     // 0.2,  0.2, 0.0,
     // 0.2, -0.2, 0.0,
// 
     // 0.0, 0.0, -0.2,
     // 0.2, -0.2, 0.0,
    // -0.2, -0.2, 0.0,
// 
     // 0.0, 0.0, -0.2,
    // -0.2, -0.2, 0.0,
    // -0.2,  0.2, 0.0,
// 
     // 0.0, 0.0, -0.2,   
    // -0.2,  0.2, 0.0,
     // 0.2,  0.2, 0.0,
		// ];
		// var vertexIndices = [
		// 0, 1, 2,
		// 3, 4, 5,
		// 6, 7, 8,
		// 9, 10, 11,
// 
		// 12, 13, 14,
		// 15, 16, 17,
		// 18, 19, 20,
		// 21, 22, 23,
		// ];
		// var textureCoords = [];
		// for (var i=0; i<8; i++) {
			// textureCoords = textureCoords.concat([
			// 0.0, 0.0,
			// 1.0, 0.0,
			// 1.0, 1.0,
			// 0.0, 1.0		
			// ]);
		// }
// 
		// var vertexNormals = [
      // 1.0, 0.0, 1.0,
      // 1.0, 0.0, 1.0,
      // 1.0, 0.0, 1.0,
      // 1.0, 0.0, 1.0,
// 
      // 0.0,-1.0, 1.0,
      // 0.0,-1.0, 1.0,
      // 0.0,-1.0, 1.0,
      // 0.0,-1.0, 1.0,
// 
     // -1.0, 0.0, 1.0, 
     // -1.0, 0.0, 1.0, 
     // -1.0, 0.0, 1.0, 
     // -1.0, 0.0, 1.0, 
// 
      // 0.0, 1.0, 1.0,
      // 0.0, 1.0, 1.0,
      // 0.0, 1.0, 1.0,
      // 0.0, 1.0, 1.0,
// 
// 
      // 1.0, 0.0,-1.0,
      // 1.0, 0.0,-1.0,
      // 1.0, 0.0,-1.0,
      // 1.0, 0.0,-1.0,
// 
      // 0.0,-1.0,-1.0,
      // 0.0,-1.0,-1.0,
      // 0.0,-1.0,-1.0,
      // 0.0,-1.0,-1.0,
// 
     // -1.0, 0.0,-1.0, 
     // -1.0, 0.0,-1.0, 
     // -1.0, 0.0,-1.0, 
     // -1.0, 0.0,-1.0, 
// 
      // 0.0, 1.0,-1.0,
      // 0.0, 1.0,-1.0,
      // 0.0, 1.0,-1.0,
      // 0.0, 1.0,-1.0,
		// ];
// 		
		// this.model = new GLColorModel(GL.SHADER_TYPE_COLOR,vertices, vertexIndices, textureCoords, vertexNormals);
		// this.size = size;
	},
	draw : function(x, y, z) {

		mvPushMatrix();
		mat4.translate(mvMatrix, [x*Game.SCALE, y*Game.SCALE, z*Game.SCALE+0.2]);
		// mat4.rotate(mvMatrix, degToRad(45), [0, 0, 1]);
    var invMatrix = mat3.create();
    mat4.toInverseMat3(mvMatrix, invMatrix);
    var invMatrix4 = mat4.create();
    mat3.toMat4(invMatrix, invMatrix4);
    
    mat4.multiply(mvMatrix, invMatrix4);

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
		
		this.speed = 0.5;
		
		this.x = x;
		this.y = y;
		this.z = z;
		
		this.xOffset = 0;
    this.yOffset = 0;
    this.zOffset = 0;
		
		if(direction == undefined) {
			this.direction = Math.random()*Math.PI*2;			
		}
		else {
			this.direction = direction;
		}

		this.xZone = Math.floor(this.x);
		this.yZone = Math.floor(this.y);
		
		this.floor = Math.floor(this.z);
		
		this.hp = 50;
		this.wait = 0;
		
	},
	update : function(map) {
	  if(this.wait != 0)
	    this.wait--;
	},
	moveCheck : function (map, sign) {

    var x = this.x;
    var y = this.y;
    var z = this.z;
    
    var floor = this.floor;
    	  
    var d = sign * 0.01 * this.speed;
    
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
		
		if (this.stan)
		  return;
		  
		var pos = this.moveCheck(map.map, sign);

		for(var id in map.actors[Math.floor(pos.z)][Math.floor(pos.y)][Math.floor(pos.x)]) {
			if(this.id == id)
				continue;
			
			var a = map.actors[Math.floor(pos.z)][Math.floor(pos.y)][Math.floor(pos.x)][id];
			if((pos.x - a.x)*(pos.x - a.x) + (pos.y - a.y)*(pos.y - a.y) + (pos.z - a.z)*(pos.z - a.z) < 0.1){
			  pushEvent(new ActorCollideActorEvent(this, a));
				return true;
			}
		}
		
		delete map.actors[Math.floor(this.z)][Math.floor(this.y)][Math.floor(this.x)][this.id];
		map.actors[Math.floor(pos.z)][Math.floor(pos.y)][Math.floor(pos.x)][this.id] = this;
		
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
	  if(this.wait != 0)
	    return;
	  
	  if (this.id == 0) {
      gm.game.console.write("15のダメージをあたえた！");	    
	  }
	  
    if (other.id == 0) {
      gm.game.console.write("15のダメージをうけた！");      
    }
    
    other.hp -= 15;
    
    attachProcess(new Shock(other));
    
    if(other.hp <= 0) {
      other.isDead = true;
      
      if (this.id ==0) {
        gm.game.console.write("モンスターを撃破した！");              
      }
      if (other.id ==0) {
        gm.game.console.write("しんでしまった・・・");              
        gm.game.console.write("オートリレイズ！");
        other.hp = 50;
      }
      
    }
      

    this.wait = 100;
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
		actorModel.draw(this.x+this.xOffset, this.y+this.yOffset, this.z+this.zOffset);
	},
}
