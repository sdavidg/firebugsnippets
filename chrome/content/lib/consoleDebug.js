
define([
],
function () {

	function alerta(){
		Firebug.Console.log(arguments);
	}

	var console = Firebug.ConsoleExposed.createFirebugConsole();
	console._ok = console._error = console._info = console._help = function(){};

	var timer = {
	   time: 0,
	   now: function(){ return (new Date()).getTime(); },
	   start: function(){ this.time = this.now(); },
	   since: function(){ return this.now()-this.time; },
	   log:  function(){ console._info(this.since()) },
	};
	console.timer = timer;
// ********************************************************************************************** //
// Registration
return console;

// ********************************************************************************************** //
});

