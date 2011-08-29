
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
	initialize : function(id, x, y, z) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.z = z;
		
		this.floor = z;
		
		this.direction = Math.random()*Math.PI*2;
	},
	update : function(map) {
		this.move(map);
	},
	move : function(map) {
				
		var d = 0.005;
		
		var dx = d*Math.sin(this.direction);
		var dy = d*Math.cos(this.direction);
		
		var pos = map.move(this.x, this.y, this.z, this.floor, dx, dy);

		//alert(this.id+" : ("+this.x+","+this.y+","+this.z+")->("+pos.x+","+pos.y+","+pos.z+")");
		
		if(this.x == pos.x && this.y == pos.y && this.z == pos.z){
			//alert("freeze : "+this.id);
		}

		if (this.x == pos.x || this.y == pos.y)
			this.direction += Math.PI*2/3 * (1 + Math.random());

		for(var id in gm.game.map.actors[Math.floor(pos.z)][Math.floor(pos.y)][Math.floor(pos.x)]) {
			if(this.id == id)
				continue;
			
			var a = gm.game.map.actors[Math.floor(pos.z)][Math.floor(pos.y)][Math.floor(pos.x)][id];
			if((pos.x - a.x)*(pos.x - a.x) + (pos.y - a.y)*(pos.y - a.y) + (pos.z - a.z)*(pos.z - a.z) < 0.1){
				this.direction += Math.PI*2/3 * (1 + Math.random());
				return;
			}
		}
		
		delete gm.game.map.actors[Math.floor(this.z)][Math.floor(this.y)][Math.floor(this.x)][this.id];
		gm.game.map.actors[Math.floor(pos.z)][Math.floor(pos.y)][Math.floor(pos.x)][id] = this;
		
		this.x = pos.x;
		this.y = pos.y;
		this.z = pos.z;
		
		this.floor = pos.floor;
	},
	draw : function() {
		actorModel.draw(this.x, this.y, this.z);
	},
}
