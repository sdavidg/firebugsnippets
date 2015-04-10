/* See license.txt for terms of usage */

define([
    "firebug/lib/trace",
    "firebugsnippets/ToolbarListener"
],
function(FBTrace, ToolbarListener) {

// ********************************************************************************************* //

var App =
{
    initialize: function()
    {
        Firebug.registerStringBundle("chrome://firebugsnippets/locale/firebugsnippets.properties");
        Firebug.registerUIListener(ToolbarListener);
    },

    shutdown: function()
    {
        Firebug.unregisterStringBundle("chrome://firebugsnippets/locale/firebugsnippets.properties");
        Firebug.unregisterUIListener(ToolbarListener);
    }
}

// ********************************************************************************************* //

return App;

// ********************************************************************************************* //
});
