var StartScene = function() {
	this.initialize.apply(this, arguments);
}

StartScene.prototype = {
	initialize : function() {
		document.getElementById("main").innerHTML = 
			'<div class="window" style="position:relative; margin:auto; width:120px; height:50px;" onclick="newScene(1)">' +
			'	<p>GAME START</p>' +
			'	</div>';		
	},
	update : function(){},
	draw : function(){},
}
