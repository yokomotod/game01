var Effect = function(){
  this.initialize.apply(this, arguments);
}

Effect.prototype = {
  initialize : function(x, y) {
    var div = document.getElementById("main");
    var left = div.offsetLeft;
    var top = div.offsetTop;
    this.x = ((x-left)-460)/100;
    this.y = -((y-top)-270)/100;
    
    this.count = 0;
    this.position = 0;
    
    this.initBuffers();
  },
  initBuffers : function() {
    this.vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
    vertices = [
         1.0,  1.0,  0.0,
        -1.0,  1.0,  0.0,
         1.0, -1.0,  0.0,
        -1.0, -1.0,  0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    this.vertexPositionBuffer.itemSize = 3;
    this.vertexPositionBuffer.numItems = 4;

    this.vertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
    var textureCoords = [
      // Front face
      0.0, 0.0,
      0.125, 0.0,
      0.0, 1.0,
      0.125, 1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    this.vertexTextureCoordBuffer.itemSize = 2;
    this.vertexTextureCoordBuffer.numItems = 4;

    this.vertexTextureOffsetBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureOffsetBuffer);
    var textureOffset = [
      0.0, 0.0,
      0.0, 0.0,
      0.0, 0.0,
      0.0, 0.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureOffset), gl.STATIC_DRAW);
    this.vertexTextureOffsetBuffer.itemSize = 2;
    this.vertexTextureOffsetBuffer.numItems = 4;
  },
  update : function() {
    this.count++;
    if (this.count % 2 == 0)
      this.position++;
    
    if (this.position >= 8) {
      this.isDead = true;
      gm.game.scene.removeChild(this);
    }
      
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureOffsetBuffer);
    var textureOffset = [
      0.125*this.position, 0.0,
      0.125*this.position, 0.0,
      0.125*this.position, 0.0,
      0.125*this.position, 0.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureOffset), gl.STATIC_DRAW); 
  },
  render : function() {
    useShaderProgram(2);
    
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    
    mvPushMatrix();

    mat4.translate(mvMatrix, [this.x, this.y, -7.0]);

    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureList[1]);

    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(shaderProgram.textureCoord2Attribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureOffsetBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoord2Attribute, this.vertexTextureOffsetBuffer.itemSize, gl.FLOAT, false, 0, 0);

    shaderProgram.setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertexPositionBuffer.numItems);
    
    mvPopMatrix();
  }
}

var Shock = function() {
  this.initialize.apply(this, arguments);
}

Shock.prototype = {
  initialize : function(targetActor) {
    this.targetActor = targetActor;
    
    this.term = 20;
    this.count = this.term;
    this.rate = this.term / 4;
    
    this.prevZ = 0;
    
    this.targetActor.stan = true;
  },
  update : function() {
    var z = 0.01*Math.sin(2*Math.PI*this.rate*this.count/this.term);
    
    this.targetActor.zOffset += z - this.prevZ;
    
    this.prevZ = z;
     
    this.count--;
    if (this.count <= 0) {
      this.targetActor.stan = false;
      this.isDead = 1;
    }
  },
}
