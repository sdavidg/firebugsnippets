/* See license.txt for terms of usage */
define([
	"firebugsnippets/window/exportImport"
],

function(ExportImport)
{

// ********************************************************************************************** //

var FirstRun =
{
	/*setToDone: function()
	{
		Firebug.setPref(Firebug.prefDomain, "firebugsnippets@sdavidg.firstRunDone", true);
	},
	isDone: function()
	{
		return Firebug.getPref(Firebug.prefDomain, "firebugsnippets@sdavidg.firstRunDone");
	},*/

	run: function(importSuccessCallback)
	{
		ExportImport.importDefaultSnippets("chrome://firebugsnippets/content/data/init.xml", importSuccessCallback);
	}

};

// ********************************************************************************************** //
// Registration

return FirstRun;

// ********************************************************************************************** //
});






