var Console = function() {
	this.initialize.apply(this, arguments);
}

Console.prototype = {
	initialize : function() {
		this.strings = ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"];
		this.start = 0;
		this.line = 11;
	},
	write : function(str) {
		this.strings[this.start] = str;
		this.start++;
		if(this.start==this.line)
			this.start=0;
		
		this.update();
	},
	update : function() {
		var text = "";

		for(var i = this.start; i < this.line; i++) {
			text += "<p>" + this.strings[i] + "</p>\n";
		}
		for(var i = 0; i < this.start; i++) {
			text += "<p>" + this.strings[i] + "</p>\n";
		}
		document.getElementById("console").innerHTML = text;
	},
}