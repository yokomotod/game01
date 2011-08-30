var GameMaster = function() {
	this.initialize.apply(this, arguments);
}

var SCENES = {
	start : EmptyScene,
	game : Game,
};

GameMaster.prototype = {
	initialize  : function() {
	  this.clock = new Clock();
	  
	  this.eventManager = new EventManager();
	  
    this.eventManager.attachListener(G.EVENT_NEWSCENE, new NewsceneListener());
	  
		this.game = new EmptyScene();
		this.key = null;
	},
	loop : function() {
	  this.clock.tick();
	  	  
	  this.eventManager.tick();
	  
		this.game.update();
		this.game.draw();
		
	},
	loadScene : function(scene) {
		var url = scene+".html";
		
		var req = new XMLHttpRequest();
		if(! req) {
			alert("failed : loadScene");
		}

		req.docurl=url;
		req.onreadystatechange = function() {
			if(this.readyState  == 4)
			{
				if(this.status  == 200 || this.status==0){
					document.getElementById("main").innerHTML = this.responseText;
					if(SCENES[scene] == undefined){
						alert("unknown scene : "+scene);
					}
					gm.game = new SCENES[scene]();
				}else{ 
					alert("Error loading Document: "+this.docurl+" status "+this.status);
				}
			}
		};
		req.open("GET", url, true);
		req.send("");
	},
}

function pushEvent(e) {
  if(! e.type){
    alert("pushEvent() : invalid event");
    return;
  }

  gm.eventManager.pushEvent(e);  
}

function triggerEvent(e) {
  if(! e.type){
    alert("triggerEvent() : invalid event");
    return;
  }

  gm.eventManager.trigger(e);
}

function attachListener(type, listener) {
  gm.eventManager.attachListener(type, listener);
}

var gm;

