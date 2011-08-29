var EmptyScene = function() {
	this.initialize.apply(this, arguments);
}

EmptyScene.prototype = {
	initialize : function() {
		// document.getElementById("main").innerHTML = 
			// '<div class="window" style="position:relative; margin:auto; width:120px; height:50px;" onclick="gm.newScene(1)">' +
			// '	<p>GAME START</p>' +
			// '	</div>';		
	},
	update : function(){},
	draw : function(){},
}
