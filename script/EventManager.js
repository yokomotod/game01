var EventManager = function() {
  this.events = new Array();
  this.eventsNum = 0;
  this.listeners = new Array();
}

EventManager.prototype.pushEvent = function(e) {
  this.events[this.eventsNum] = e;
  this.eventsNum++;
}

EventManager.prototype.trigger = function(e) {
  if(!this.listeners[e.type]) {
    alert("unknown event type : " + e.type);
    return;
  }

  for(var i = 0; i < this.listeners[e.type].length; i++) {
    this.listeners[e.type][i].tick(e);
  }
}

EventManager.prototype.tick = function() {
  for(var i = 0; i < this.eventsNum; i++) {
    this.trigger(this.events[i]);
    delete this.events[i];
  }

  this.eventsNum = 0;
}

EventManager.prototype.attachListener = function(eventType, eventListener) {
  if(eventType==undefined) {
    alert("eventType undefined");
    return;
  }
  
  if(!this.listeners[eventType]) {
    this.listeners[eventType] = new Array();
  }

  this.listeners[eventType][this.listeners[eventType].length] = eventListener;
}

var G = {};
G.EVENT_EMPTY = 0;
G.EVENT_KEY = 1;
G.EVENT_NEWSCENE = 2;
G.EVENT_ACTOR_MOVE = 3;
G.EVENT_PLAYER_MOVE = 4;

var EmptyEvent = function() {}
EmptyEvent.prototype.type = G.EVENT_EMPTY;

var KeyEvent = function(key){
  this.key = key;
}
KeyEvent.prototype.type = G.EVENT_KEY;

var NewsceneEvent = function (scene) {
  this.scene = scene;
}
NewsceneEvent.prototype.type = G.EVENT_NEWSCENE;

var ActorMoveEvent = function (actor, map, sign) {
  this.actor = actor;
  this.map = map
  this.sign = sign;
}
ActorMoveEvent.prototype.type = G.EVENT_ACTOR_MOVE;

var PlayerMoveEvent = function (player, map, sign) {
  this.player = player;
  this.map = map;
  this.sign = sign;
}
PlayerMoveEvent.prototype.type = G.EVENT_PLAYER_MOVE;

var EmptyListener = function() {}
EmptyListener.prototype.tick = function(e) {}

var KeyListener = function () {}
KeyListener.prototype.tick = function(e) {
  gm.game.inputProc(e.key);
}

var NewsceneListener = function() {}
NewsceneListener.prototype.tick = function (e) {
  gm.loadScene(e.scene);  
}

var ActorMoveListener = function() {}
ActorMoveListener.prototype.tick = function (e) {
  e.actor.move(e.map, e.sign);
}

var PlayerMoveListener = function() {}
PlayerMoveListener.prototype.tick = function (e) {
  triggerEvent(new ActorMoveEvent(e.player, e.map, e.sign));
  e.player.movePlayer(e.map);
}
