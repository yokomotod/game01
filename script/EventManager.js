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
    alert("eventType undefined : "+this.toSource);
    return;
  }
  
  if(!this.listeners[eventType]) {
    this.listeners[eventType] = new Array();
  }

  this.listeners[eventType][this.listeners[eventType].length] = eventListener;
}

EventManager.prototype.clear = function () {
  this.events = new Array();
  this.eventsNum = 0;
}

var G = {};
G.EVENT_EMPTY = 0;
G.EVENT_KEY = 1;
G.EVENT_MOUSE = 2;
G.EVENT_NEWSCENE = 3;
G.EVENT_ACTOR_MOVE = 4;
G.EVENT_PLAYER_MOVE = 5;
G.EVENT_ACTOR_COLLIDE = 6;
G.EVENT_ACTOR_COLLIDE_ACTOR = 7;

var EmptyEvent = function() {}
EmptyEvent.prototype.type = G.EVENT_EMPTY;

var KeyEvent = function(key){
  this.key = key;
}
KeyEvent.prototype.type = G.EVENT_KEY;

var MouseEvent = function(mouse){
  this.mouse = mouse;
}
MouseEvent.prototype.type = G.EVENT_MOUSE;

var NewsceneEvent = function (scene) {
  // clearEvent();
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

var ActorCollideEvent = function (actor) {
  this.actor = actor;
}
ActorCollideEvent.prototype.type = G.EVENT_ACTOR_COLLIDE;

var ActorCollideActorEvent = function (actor, other) {
  this.actor = actor;
  this.other = other;
}
ActorCollideActorEvent.prototype.type = G.EVENT_ACTOR_COLLIDE_ACTOR;


var EmptyListener = function() {}
EmptyListener.prototype.tick = function(e) {}

var KeyListener = function () {}
KeyListener.prototype.tick = function(e) {
  gm.game.inputProc(e.key);
}

var MouseListener = function () {}
MouseListener.prototype.tick = function(e) {
  var mouse = e.mouse;
  if (mouse.down) {
    if (mouse.left) {
      gm.mouse.left = true;      
    }
    else if (mouse.right) {
      gm.mouse.right = true;      
    }
  }
  if (mouse.up) {
    if (mouse.left) {
      gm.mouse.left = false;      
    }
    else if (mouse.right) {
      gm.mouse.right = false;      
    }
  }
  if (mouse.move) {
    gm.mouse.prev = gm.mouse.curr;
    gm.mouse.curr = {x:mouse.x, y:mouse.y};
    
    if (gm.mouse.left && gm.mouse.prev && gm.game.mouseProc)
      gm.game.mouseProc();    
  }
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

var ActorCollideListener = function() {}
ActorCollideListener.prototype.tick = function (e) {
  if(e.actor.isPlayer)
    return;
    
  e.actor.collide();
}

var ActorCollideActorListener = function() {}
ActorCollideActorListener.prototype.tick = function (e) {
  triggerEvent(new ActorCollideEvent(e.actor));
  
  e.actor.collideOther(e.other);
}

