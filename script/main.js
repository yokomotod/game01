var gl;

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

var vertexShaderSource =
	'attribute vec3 aVertexPosition;' + "\n" +
	'attribute vec3 aVertexNormal;' + "\n" +
	'attribute vec2 aTextureCoord;' + "\n" +
	
	'uniform mat4 uMVMatrix;' + "\n" +
	'uniform mat4 uPMatrix;' + "\n" +
	'uniform mat3 uNMatrix;' + "\n" +
	
	'varying vec2 vTextureCoord;' + "\n" +
	'varying vec3 vTransformedNormal;' + "\n" +
	'varying vec4 vPosition;' + "\n" +
	
	'void main(void) {' + "\n" +
	'	vPosition = uMVMatrix * vec4(aVertexPosition, 1.0);' + "\n" +
	'	gl_Position = uPMatrix * vPosition;' + "\n" +
		
	'	vTextureCoord = aTextureCoord;' + "\n" +
		
	'	vTransformedNormal = uNMatrix * aVertexNormal;' + "\n" +
	'}';

var fragmentShaderSource =
	'#ifdef GL_ES' + "\n" +
	'precision highp float;' + "\n" +
	'#endif' + "\n" +

	'varying vec2 vTextureCoord;' + "\n" +
	'varying vec3 vTransformedNormal;' + "\n" +
	'varying vec4 vPosition;' + "\n" +

	'uniform float uMaterialShininess;' + "\n" +

	'uniform vec3 uAmbientColor;' + "\n" +

	'uniform vec3 uPointLightingLocation;' + "\n" +

	'uniform vec3 uPointLightingSpecularColor;' + "\n" +
	'uniform vec3 uPointLightingDiffuseColor;' + "\n" +

	'uniform sampler2D uSampler;' + "\n" +

	'void main(void) {' + "\n" +
	'	vec3 ray = uPointLightingLocation - vPosition.xyz;' + "\n" +
	'	float distance = length(ray);' + "\n" +
		
	'	vec3 lightDirection = normalize(ray);' + "\n" +
	'	vec3 normal = normalize(vTransformedNormal);' + "\n" +

	'	vec3 eyeDirection = normalize(-vPosition.xyz);' + "\n" +
	'	vec3 reflectionDirection = reflect(-lightDirection, normal);' + "\n" +

	'	float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uMaterialShininess) / max(distance, 1.0);' + "\n" +

    '   float diffuseLightWeighting = max(dot(normal, lightDirection), 0.0) / max(distance, 1.0);' + "\n" +
        
    '    vec3 lightWeighting = uAmbientColor' + "\n" +
    '        + uPointLightingSpecularColor * specularLightWeighting;' + "\n" +
    '        + uPointLightingDiffuseColor * diffuseLightWeighting;' + "\n" +

	'	// float pointLightingWeighting = max(dot(transformedNormal, lightDirection), 0.0);' + "\n" +
	'	// vec3 vLightWeighting = uAmbientColor + uPointLightingColor * pointLightingWeighting;' + "\n" +

	'	vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));' + "\n" +
	'	gl_FragColor = vec4(textureColor.rgb * lightWeighting, textureColor.a);' + "\n" +
	'}';

var shaderProgram;

function initShaders() {
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);;
	gl.shaderSource(fragmentShader, fragmentShaderSource);
	gl.compileShader(fragmentShader);
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(fragmentShader));
		return null;
	}
	
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vertexShaderSource);
	gl.compileShader(vertexShader);
	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(vertexShader));
		return null;
	}

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
	gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

	shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
	gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
	shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
	shaderProgram.materialShininessUniform = gl.getUniformLocation(shaderProgram, "uMaterialShininess");
	shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
	shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shaderProgram, "uPointLightingLocation");
	shaderProgram.pointLightingSpecularColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingSpecularColor");
	shaderProgram.pointLightingDiffuseColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingDiffuseColor");

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
}

function degToRad(degrees) {
	return degrees * Math.PI / 180;
}

var cameraPos, cameraRotX, cameraRotY, cameraRotZ;

var game;
var mapper;

function keyDown(e) {
	var key = e.keyCode;
	game.key = key;
}

function start() {
	document.getElementById("main").innerHTML = 
		'<div class="window" style="position:relative; margin:auto; width:120px; height:50px;" onclick="newScene(1)">' +
		'	<p>GAME START</p>' +
		'	</div>';
}

function mazegame() {
	document.getElementById("main").innerHTML = 
			'<canvas id="canvas" width="960" height="540"></canvas>' +
			'<div id="menu" class="window">' +
			'	<h1 style="margin:0;padding:0;padding-bottom: 5px;font-size: 20px">Game01</h1>' +
			'	<div id="floor" style="margin:0;padding:0;padding-bottom: 5px;font-size: 20px"></div>' +
			'	<p onclick="newScene(0)">EXIT</p>' +
			'</div>' +
			'<canvas id="map" class="window" width="507" height="507" style="display:none" onclick=hidemap()></div>';

	var canvas = document.getElementById("canvas");
	initGL(canvas);
	initShaders()
	initTexture();

	gl.clearColor(0.0, 0.0, 1.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	game = new Game();

	setInterval("game.loop()", 1000 / 60);
	document.onkeydown = keyDown;

	var mapCanvas = document.getElementById("map");
	mapper = new Mapper(mapCanvas);
	
	game.draw();	
}
function newScene(scene) {
	switch (scene) {
		case 0:
			start();
			break;
		case 1:
			mazegame();
			break;
	}
}
function main() {
	newScene(0);
}