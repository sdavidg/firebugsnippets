define([
	"firebugsnippets/lib/dynamicLoader",
	"firebugsnippets/window/store",
	"firebug/lib/lib",
	"firebugsnippets/window/options",
	"firebugsnippets/lib/consoleDebug",
],
function(DynamicLoader, Store, FBL, Options, console)
{
	var $j;
	var that;
	var myCodeMirror;
	function SnippetsWindowEdit(win, idSnippet, conf)
	{
		that = this;
		this.window = win;
		this.document = this.window.document;
		this.idSnippet = idSnippet;
		this.conf = conf;

		this.baseruta = "chrome://firebugsnippets/skin/";
		var rutaLib = "chrome://firebugsnippets/content/lib/"
		
		var appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
			.getService(Components.interfaces.nsIXULAppInfo);
		
		var arrJS, rutaCodemirror;		
		if(parseInt(appInfo.version)<=43)
		{
			rutaCodemirror = "chrome://browser/content/devtools/codemirror/";
			arrJS = [	
				rutaLib+"jquery.min.js",
				rutaLib+"jqueryInitializer.js",
				rutaCodemirror+"codemirror.js",
				rutaCodemirror+"dialog.js",
				rutaCodemirror+"searchcursor.js",
				rutaCodemirror+"search.js",
				rutaCodemirror+"activeline.js",
				rutaLib+"codemirror/addon/search/match-highlighter.js",
				rutaCodemirror+"matchbrackets.js",
				rutaCodemirror+"javascript.js",
				rutaCodemirror+"foldcode.js",
				rutaCodemirror+"foldgutter.js",
				rutaCodemirror+"brace-fold.js",
				rutaCodemirror+"comment-fold.js",
				rutaLib+"codeMirrorInitializer.js",
			];
		}
		else
		{
			rutaCodemirror = "chrome://devtools/content/sourceeditor/codemirror/";
			arrJS = [	
				rutaLib+"jquery.min.js",
				rutaLib+"jqueryInitializer.js",
				rutaCodemirror+"codemirror.js",
				rutaCodemirror+"dialog/dialog.js",
				rutaCodemirror+"search/searchcursor.js",
				rutaCodemirror+"search/search.js",
				rutaCodemirror+"selection/active-line.js",
				rutaLib+"codemirror/addon/search/match-highlighter.js",
				rutaCodemirror+"edit/matchbrackets.js",
				rutaCodemirror+"mode/javascript.js",
				rutaCodemirror+"fold/foldcode.js",
				rutaCodemirror+"fold/foldgutter.js",
				rutaCodemirror+"fold/brace-fold.js",
				rutaCodemirror+"fold/comment-fold.js",
				rutaLib+"codeMirrorInitializer.js",
			];
		}

		var dynamicLoader = new DynamicLoader(
		that.window,
		arrJS,
		[
			rutaCodemirror+"codemirror.css",
			rutaLib+"codemirror/addon/fold/foldgutter.css",
			rutaLib+"codemirror/codemirror_myConfigStyles.css",
		],
		function(){
			$j = that.window.initJQuery(that.window);
			myCodeMirror = that.window.initCodemirror(that.window, $j);
			
			var resizeTimer;
			$j(that.window).bind("resize",function(){				
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(saveDimWindow, 250);					
			});
		});
		dynamicLoader.load();
	}

	function altoWindow(window){
		return window.document.body["clientHeight"] ;
	}

	function saveDimWindow() 
	{
		Options.setPref(Options.snippetsWindowEditWidth, $j(that.window).width());
		Options.setPref(Options.snippetsWindowEditHeight, altoWindow(that.window));
	};
	
SnippetsWindowEdit.prototype =
{
	onLoad: function()
	{
		var id_snippets_groups;

		if(this.idSnippet)
		{
			Store.getById(this.idSnippet, (snippetConcreto) => {
				$j("#name").val(snippetConcreto.name);
				//$j("#code").val(snippetConcreto.code);
				myCodeMirror.setValue(snippetConcreto.code);
				id_snippets_groups = snippetConcreto.id_snippets_groups
			});
		}

		var grupos = $j("#id_snippets_groups").empty();
		Store.getAllGroups((groups) => {
			for (var key_group in groups)
			{
				if (groups.hasOwnProperty(key_group))
				{
					var id_groups = groups[key_group].id;
					var name_group = groups[key_group].name;
					var option = $j("<option>").val(id_groups).text(name_group).appendTo(grupos);
					if(id_snippets_groups == id_groups){
						option.attr("selected","selected");
					}
				}
			}
		});

		$j("#save").click(this.save.bind(this)).html(FBL.$STR("firebugsnippets.snippetsWindowEdit.save"));
		$j("#cancel").click(this.cancel.bind(this)).html(FBL.$STR("firebugsnippets.snippetsWindowEdit.cancel"));
		$j("#name_group").html(FBL.$STR("firebugsnippets.snippetsWindowEdit.name_group"));

		$j(this.window).bind('keydown', function(e){
			if((e.which || e.keyCode)==27)
			{
				that.cancel();
			}
		});

	},
	cancel: function()
	{
		this.conf.cancel = true;
		this.window.close();
	},
	save: function()
	{
		var name = $j("#name").val();
		//var code = $j("#code").val();
		var code = myCodeMirror.getValue();
		var id_snippets_groups = $j("#id_snippets_groups").val();

		if(!name || !code)
		{
			that.window.alert(FBL.$STR("firebugsnippets.snippetsWindowEdit.message_info"));
			return;
		}

		if(that.idSnippet)
		{
			var snippet = {
				id: that.idSnippet,
				name: name,
				code: code,
				id_snippets_groups: id_snippets_groups
			};

			Store.update(snippet, () => {
				that.conf.save = true;
				that.window.close();
			});
		}
		else
		{
			var snippet = {
				id: that.idSnippet,
				name: name,
				code: code,
				id_snippets_groups: id_snippets_groups
			};

			Store.insert(snippet, () => {
				that.conf.save = true;
				that.window.close();
			});
		}
	}
};


// ********************************************************************************************** //
// Registration

return SnippetsWindowEdit;

// ********************************************************************************************** //
});
