/* See license.txt for terms of usage */

define([
	"firebug/firebug",
	"firebug/lib/lib",
	"firebugsnippets/window/snippetsWindow",
	"firebugsnippets/window/options"
],

function(Firebug, FBL, SnippetsWindow, Options)
{

// ********************************************************************************************** //
// Implementation

var ToolbarListener =
{
	/**
	 * Extends Console panel toolbar.
	 */
	win: null,

	onGetPanelToolbarButtons: function(panel, buttons)
	{
		if (panel.name != "console")
		{
			return;
		}

		if (FBL.$("firebugsnippets-button"))
		{
			return;
		}

		var fbHistoryButton = FBL.$("fbCommandEditorHistoryButton");

		var snippetsButton = this.fsCreateButton({
			id: "firebugsnippets-button",
			label: FBL.$STR("firebugsnippets.snippetsbutton.label"),
			tooltiptext: FBL.$STR("firebugsnippets.snippetsbutton.tooltip"),
			icon: "chrome://firebugsnippets/skin/cut.png",
			command: function () {
				this.onOpenWindow(false);
			}
		});

		fbHistoryButton.parentNode.insertBefore(snippetsButton, fbHistoryButton.nextSibling);
	},

	
	//fsCreateButton: function (id, label, tooltipText, command)
	fsCreateButton: function (options)
	{
		var fbHistoryButton = FBL.$("fbCommandEditorHistoryButton");
		var ownerDocument = fbHistoryButton.ownerDocument;
		var button = ownerDocument.createElement("toolbarbutton");

		button.setAttribute("id", options.id);
		button.setAttribute("label", options.label);
		button.setAttribute("tooltiptext", options.tooltiptext);
		button.setAttribute("image", options.icon);
		button.addEventListener("command", FBL.bindFixed(options.command, this), false);

		return button;
	},

	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
	// Commands

	onOpenWindow: function()
	{
		if (this.win == null || this.win.closed)
		{
			var args = {
				Firebug: Firebug,
				FBTrace: FBTrace,
				SnippetsWindow: SnippetsWindow
			};
			var w = Options.getPref(Options.snippetsWindowWidth) || 360;
			var h = Options.getPref(Options.snippetsWindowHeight) || 420;
		
			this.win = window.openDialog(
				"chrome://firebugsnippets/content/window/SnippetsWindow.html",
				"SnippetsWindow",				
				"resizable,width="+w+",height="+h,
				args);
		}
		else
		{
			this.win.focus();
		}
	}
};

// ********************************************************************************************** //

return ToolbarListener;

// ********************************************************************************************** //

});
