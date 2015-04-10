/* See license.txt for terms of usage */
define([
	"firebugsnippets/window/exportImport"
],

function(ExportImport)
{

// ********************************************************************************************** //
const VERSION = 2;
const prefName = "firebugsnippets@sdavidg.";
const prefVersion = "version";

var Options =
{
	snippetsWindowWidth:"snippetsWindowWidth",
	snippetsWindowHeight:"snippetsWindowHeight",

	snippetsWindowEditWidth:"snippetsWindowEditWidth",
	snippetsWindowEditHeight:"snippetsWindowEditHeight",
	
	setPref: function(name, value)
	{
		Firebug.setPref(Firebug.prefDomain, prefName+name, value);
	},
	getPref: function(name)
	{
		return Firebug.getPref(Firebug.prefDomain, prefName+name);
	},	
	
	updateToLatestVersion: function(importSuccessCallback)
	{
		this.setPref(prefVersion, VERSION);
	},
	
	isLatestVersion: function(importSuccessCallback)
	{
		return this.getPref(prefVersion) == VERSION;
	},
	
	getVersion: function(importSuccessCallback)
	{
		return VERSION;
	},
	run: function(importSuccessCallback)
	{
		ExportImport.importDefaultSnippets("chrome://firebugsnippets/content/data/init.xml", importSuccessCallback);
	}

};

// ********************************************************************************************** //
// Registration

return Options;

// ********************************************************************************************** //
});






