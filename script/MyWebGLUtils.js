var gl;

var GL = {SHADER_TYPE_COLOR:0, SHADER_TYPE_TEXTURE:1};

function initGL(canvas) {
  try {
    gl = canvas.getContext("experimental-webgl");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  } catch (e) {
  }
  if(!gl) {
    alert("Could not initialise WebGL, sorry :-(");
  }
}

var shaderProgram;
var shaderProgramTexture;
var shaderProgramColor;

function createShaderProgram(fragmentShaderSource, vertexShaderSource) {
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  ;
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(fragmentShader));
    alert(fragmentShaderSource);
    return null;
  }

  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(vertexShader));
    alert(vertexShaderSource);
    return null;
  }

  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Could not initialise shaders");
  }

  return shaderProgram;
}

function useShaderProgram(shaderType) {
  switch (shaderType) {
    case 0:
      shaderProgram = shaderProgramColor;
      break;
    case 1:
      shaderProgram = shaderProgramTexture;
      break;
  }

  gl.useProgram(shaderProgram)
}

function initShaders() {
  shaderProgramTexture = createShaderProgram(fragmentShaderSourceTexture, vertexShaderSourceTexture);

  shaderProgramTexture.vertexPositionAttribute = gl.getAttribLocation(shaderProgramTexture, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgramTexture.vertexPositionAttribute);

  shaderProgramTexture.vertexNormalAttribute = gl.getAttribLocation(shaderProgramTexture, "aVertexNormal");
  gl.enableVertexAttribArray(shaderProgramTexture.vertexNormalAttribute);

  shaderProgramTexture.textureCoordAttribute = gl.getAttribLocation(shaderProgramTexture, "aTextureCoord");
  gl.enableVertexAttribArray(shaderProgramTexture.textureCoordAttribute);

  shaderProgramTexture.pMatrixUniform = gl.getUniformLocation(shaderProgramTexture, "uPMatrix");
  shaderProgramTexture.mvMatrixUniform = gl.getUniformLocation(shaderProgramTexture, "uMVMatrix");
  shaderProgramTexture.nMatrixUniform = gl.getUniformLocation(shaderProgramTexture, "uNMatrix");
  shaderProgramTexture.samplerUniform = gl.getUniformLocation(shaderProgramTexture, "uSampler");
  shaderProgramTexture.materialShininessUniform = gl.getUniformLocation(shaderProgramTexture, "uMaterialShininess");
  shaderProgramTexture.ambientColorUniform = gl.getUniformLocation(shaderProgramTexture, "uAmbientColor");
  shaderProgramTexture.pointLightingLocationUniform = gl.getUniformLocation(shaderProgramTexture, "uPointLightingLocation");
  shaderProgramTexture.pointLightingSpecularColorUniform = gl.getUniformLocation(shaderProgramTexture, "uPointLightingSpecularColor");
  shaderProgramTexture.pointLightingDiffuseColorUniform = gl.getUniformLocation(shaderProgramTexture, "uPointLightingDiffuseColor");

  shaderProgramTexture.setMatrixUniforms = function() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

    var normalMatrix = mat3.create();
    mat4.toInverseMat3(mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);

    gl.uniform1i(shaderProgram.samplerUniform, 0);

    gl.uniform1f(shaderProgram.materialShininessUniform, 1.0);

    gl.uniform3f(shaderProgram.ambientColorUniform, 0.6, 0.6, 0.6);
    gl.uniform3f(shaderProgram.pointLightingSpecularColorUniform, 0.8, 0.8, 0.8);
    gl.uniform3f(shaderProgram.pointLightingDiffuseColorUniform, 0.8, 0.8, 0.8);

    var vCamera = mat4.multiplyVec3(mvMatrix, [0.0, 0.3, 0.5]);
    gl.uniform3f(shaderProgram.pointLightingLocationUniform, vCamera[0], vCamera[1], vCamera[2]);

    gl.uniform3f(shaderProgram.pointLightingColorUniform, 1.0, 1.0, 1.0);

  };

  shaderProgramColor = createShaderProgram(fragmentShaderSourceColor, vertexShaderSourceColor);

  shaderProgramColor.vertexPositionAttribute = gl.getAttribLocation(shaderProgramColor, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgramColor.vertexPositionAttribute);

  shaderProgramColor.pMatrixUniform = gl.getUniformLocation(shaderProgramColor, "uPMatrix");
  shaderProgramColor.mvMatrixUniform = gl.getUniformLocation(shaderProgramColor, "uMVMatrix");
  shaderProgramColor.samplerUniform = gl.getUniformLocation(shaderProgramColor, "uSampler");

  shaderProgramColor.setMatrixUniforms = function() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

    gl.uniform1i(shaderProgram.samplerUniform, 0);
  };

  useShaderProgram(1);
}

var neheTexture;
function initTexture() {
  neheTexture = gl.createTexture();
  neheTexture.image = new Image();
  neheTexture.image.onload = function() {
    if(neheTexture.image == null) {
      alert("can't open image");
      w
    }
    handleLoadedTexture(neheTexture);
  }
  neheTexture.image.src = "media/bric.png";
}

function handleLoadedTexture(texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

function mvPushMatrix() {
  var copy = mat4.create();
  mat4.set(mvMatrix, copy);
  mvMatrixStack.push(copy);
}

function mvPopMatrix() {
  if(mvMatrixStack.length == 0) {
    throw "Invalid popMatrix!";
  }
  mvMatrix = mvMatrixStack.pop();
}

function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

  var normalMatrix = mat3.create();
  mat4.toInverseMat3(mvMatrix, normalMatrix);
  mat3.transpose(normalMatrix);
  gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);

  gl.uniform1i(shaderProgram.samplerUniform, 0);

  gl.uniform1f(shaderProgram.materialShininessUniform, 1.0);

  gl.uniform3f(shaderProgram.ambientColorUniform, 0.6, 0.6, 0.6);
  gl.uniform3f(shaderProgram.pointLightingSpecularColorUniform, 0.8, 0.8, 0.8);
  gl.uniform3f(shaderProgram.pointLightingDiffuseColorUniform, 0.8, 0.8, 0.8);

  var vCamera = mat4.multiplyVec3(mvMatrix, [0.0, 0.3, 0.5]);
  gl.uniform3f(shaderProgram.pointLightingLocationUniform, vCamera[0], vCamera[1], vCamera[2]);

  gl.uniform3f(shaderProgram.pointLightingColorUniform, 1.0, 1.0, 1.0);
}

function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

var cameraPos, cameraRotX, cameraRotY, cameraRotZ;

var vertexShaderSourceTexture = " \n\
attribute vec3 aVertexPosition;  \n\n \n\
attribute vec3 aVertexNormal; \n\
attribute vec2 aTextureCoord; \n\
\n\
uniform mat4 uMVMatrix; \n\
uniform mat4 uPMatrix; \n\
uniform mat3 uNMatrix; \n\
\n\
varying vec2 vTextureCoord; \n\
varying vec3 vTransformedNormal; \n\
varying vec4 vPosition; \n\
\n\
void main(void) { \n\
vPosition = uMVMatrix * vec4(aVertexPosition, 1.0); \n\
gl_Position = uPMatrix * vPosition; \n\
vTextureCoord = aTextureCoord; \n\
vTransformedNormal = uNMatrix * aVertexNormal; \n\
} \n\
";

var fragmentShaderSourceTexture = " \n\
#ifdef GL_ES \n\
precision highp float; \n\
#endif \n\
\n\
varying vec2 vTextureCoord; \n\
varying vec3 vTransformedNormal; \n\
varying vec4 vPosition; \n\
\n\
uniform float uMaterialShininess; \n\
uniform vec3 uAmbientColor; \n\
uniform vec3 uPointLightingLocation; \n\
uniform vec3 uPointLightingSpecularColor; \n\
uniform vec3 uPointLightingDiffuseColor; \n\
uniform sampler2D uSampler; \n\
\n\
void main(void) { \n\
\n\
vec3 ray = uPointLightingLocation - vPosition.xyz; \n\
float distance = length(ray); \n\
vec3 lightDirection = normalize(ray); \n\
vec3 normal = normalize(vTransformedNormal); \n\
vec3 eyeDirection = normalize(-vPosition.xyz); \n\
vec3 reflectionDirection = reflect(-lightDirection, normal); \n\
float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uMaterialShininess) / max(distance, 1.0); \n\
float diffuseLightWeighting = max(dot(normal, lightDirection), 0.0) / max(distance, 1.0); \n\
vec3 lightWeighting = uAmbientColor + uPointLightingSpecularColor * specularLightWeighting + uPointLightingDiffuseColor * diffuseLightWeighting; \n\
// float pointLightingWeighting = max(dot(transformedNormal, lightDirection), 0.0); \n\
// vec3 vLightWeighting = uAmbientColor + uPointLightingColor * pointLightingWeighting; \n\
vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t)); \n\
gl_FragColor = vec4(textureColor.rgb * lightWeighting, textureColor.a); \n\
\n\
} \n\
";

var vertexShaderSourceColor = " \n\
attribute vec3 aVertexPosition; \n\
uniform mat4 uMVMatrix; \n\
uniform mat4 uPMatrix; \n\
varying vec4 vPosition; \n\
void main(void) { \n\
vPosition = uMVMatrix * vec4(aVertexPosition, 1.0); \n\
gl_Position = uPMatrix * vPosition; \n\
} \n\
";

var fragmentShaderSourceColor = " \n\
#ifdef GL_ES \n\
precision highp float; \n\
#endif \n\
\n\
void main(void) { \n\
gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); \n\
} \n\
";