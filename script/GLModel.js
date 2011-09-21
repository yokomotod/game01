var GLModel = function() {
	this.initialize.apply(this, arguments);
}
GLModel.prototype = {
	initialize : function(shaderType, vertices, vertexIndecies, textureCoods, vertexNormals) {

    this.shaderType = shaderType;
    
		this.modelPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.modelPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		this.modelPositionBuffer.itemSize = 3;
		this.modelPositionBuffer.numItems = vertices.length / 3;

		this.modelIndexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.modelIndexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndecies), gl.STATIC_DRAW);
		this.modelIndexBuffer.itemSize = 1;
		this.modelIndexBuffer.numItems = vertexIndecies.length;

		this.modelVertexNormalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.modelVertexNormalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
		this.modelVertexNormalBuffer.itemSize = 3;
		this.modelVertexNormalBuffer.numItems = vertexNormals.length / 3;

		this.modelTextureCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.modelTextureCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoods), gl.STATIC_DRAW);
		this.modelTextureCoordBuffer.itemSize = 2;
		this.modelTextureCoordBuffer.numItems = textureCoods.length / 2;
	},
	draw : function() {
	  useShaderProgram(this.shaderType);
	  
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.modelPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.modelPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.modelVertexNormalBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, this.modelVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.modelTextureCoordBuffer);
		gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.modelTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.modelIndexBuffer);
		shaderProgram.setMatrixUniforms();
		gl.drawElements(gl.TRIANGLES, this.modelIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}
}


var GLColorModel = function() {
  this.initialize.apply(this, arguments);
}
GLColorModel.prototype = {
  initialize : function(shaderType, vertices, vertexIndecies, textureCoods, vertexNormals) {

    this.shaderType = shaderType;
    
    this.modelPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.modelPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    this.modelPositionBuffer.itemSize = 3;
    this.modelPositionBuffer.numItems = vertices.length / 3;

    this.modelIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.modelIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndecies), gl.STATIC_DRAW);
    this.modelIndexBuffer.itemSize = 1;
    this.modelIndexBuffer.numItems = vertexIndecies.length;

    this.modelVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.modelVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
    this.modelVertexNormalBuffer.itemSize = 3;
    this.modelVertexNormalBuffer.numItems = vertexNormals.length / 3;

  },
  draw : function() {
    useShaderProgram(this.shaderType);
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.modelPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.modelPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.modelVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, this.modelVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.modelIndexBuffer);
    shaderProgram.setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, this.modelIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  }
}

var GLSpriteModel = function() {
  this.initialize.apply(this, arguments);
}
GLSpriteModel.prototype = {
  initialize : function(shaderType, vertices, textureCoods) {

    this.shaderType = shaderType;
    
    this.modelPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.modelPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    this.modelPositionBuffer.itemSize = 3;
    this.modelPositionBuffer.numItems = vertices.length / 3;

    this.modelTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.modelTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoods), gl.STATIC_DRAW);
    this.modelTextureCoordBuffer.itemSize = 2;
    this.modelTextureCoordBuffer.numItems = textureCoods.length / 2;
  },
  draw : function() {
    useShaderProgram(this.shaderType);
    
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.modelPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.modelPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.modelTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.modelTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    shaderProgram.setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.modelPositionBuffer.numItems);
  }
}
