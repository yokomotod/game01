var EventManager = function() {
  this.events = new Array();
  this.eventsNum = 0;
  this.listeners = new Array();
}

EventManager.prototype.pushEvent = function(e) {
  this.events[this.eventsNum] = e;
  this.eventsNum++;
}

EventManager.prototype.callListener = function(e) {
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
    this.callListener(this.events[i]);
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

var EmptyEvent = function() {}
EmptyEvent.prototype.type = G.EVENT_EMPTY;

var KeyEvent = function(key){
  this.key = key;
}
KeyEvent.prototype.type = G.EVENT_KEY;

var EmptyListener = function() {}
EmptyListener.prototype.tick = function(e) {}

var KeyListener = function () {}
KeyListener.prototype.tick = function(e) {
  alert(e.key);
}

// var eventManager = new EventManager();
// 
// 
// eventManager.addListener(G.EMPTY_EVENT, new EmptyListener());
// 
// eventManager.pushEvent(new EmptyEvent());
// eventManager.pushEvent(new EmptyEvent());
// eventManager.pushEvent(new EmptyEvent());
// 
// eventManager.tick();
// 
// alert("next");
// 
// eventManager.pushEvent(new EmptyEvent());
// 
// eventManager.tick();
