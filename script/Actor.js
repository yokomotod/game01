
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
		mat4.translate(mvMatrix, [(x+0.5)*game.scale, (y+0.5)*game.scale, 0.3]);
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
	initialize : function(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	},
	draw : function() {
		actorModel.draw(this.x, this.y, this.z);
	},
}
