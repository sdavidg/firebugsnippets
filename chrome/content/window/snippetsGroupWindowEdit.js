define([
	"firebugsnippets/lib/dynamicLoader",
	"firebugsnippets/window/store",
	"firebugsnippets/lib/consoleDebug",
],
function(DynamicLoader, Store, console)
{
	var $j;
	var that;
	function SnippetsGroupWindowEdit(win, idSnippet, conf)
	{
		this.window = win;
		this.document = this.window.document;
		this.conf = conf;

		that = this;
		this.baseruta = "chrome://firebugsnippets/skin/";

		var dynamicLoader = new DynamicLoader(
			that.window,
			[
				"chrome://firebugsnippets/content/lib/jquery.min.js",
				"chrome://firebugsnippets/content/lib/jqueryInitializer.js"
			],
			[],
			function(){
				$j = that.window.initJQuery(that.window);
			});
		dynamicLoader.load();
	}

SnippetsGroupWindowEdit.prototype =
{
	onLoad: function()
	{
		//eventos para guardar y cancelar
		$j("#save").click(this.save.bind(this)).html(FBL.$STR("firebugsnippets.snippetsWindowEdit.save"));
		$j("#cancel").click(this.cancel.bind(this)).html(FBL.$STR("firebugsnippets.snippetsWindowEdit.cancel"));
		$j("#name_group").html(FBL.$STR("firebugsnippets.snippetsGroupWindowEdit.name_group"));
		$j("#open_group").html(FBL.$STR("firebugsnippets.snippetsGroupWindowEdit.open"));

		$j(this.window).bind('keydown', function(e){
			if((e.which || e.keyCode)==27)
			{
				that.cancel();
			}
		});

		var body_groups = $j("#body_groups");
		//add event for delete group
		$j("img.delete").click(function()
		{
			var tr = $j(this).parent().parent();
			if(tr.hasClass("new"))
			{
				tr.find('td').wrapInner('<div />').children().slideUp(350).promise().done(function() {
					tr.remove();
				});
			}
			else
			{
				tr.toggleClass("delete");
			}
		});

		//add event for add group
		$j("#add").click(function()
		{
			body_groups.append(dummy.clone(true, true).addClass("new"));
		});

		//Este elemento es la fila que se insertará para cada snippet
		//es necesario meterlo en una tabla, porque si simplemente se borra
		//aunque seguimos teniendo una referencia para el elemento las imágenes
		//que contiene ya no lanzan los eventos
		var dummy = $j("#dummy").removeAttr("id");
		var dummyTable = $j("<table>");
		dummyTable.append(dummy);

		//var grupos = $j("#id_group").empty();
		Store.getAllGroups((groups) => {
			for (var key_group in groups)
			{
				if (groups.hasOwnProperty(key_group))
				{
					var id_group = groups[key_group].id;
					var name_group = groups[key_group].name;
					var open_group = !!groups[key_group].open;
					var tr = dummy.clone(true, true);
					if(Store.idSnippetGroupDefault == id_group)
					{
						tr.find("img").remove();
					}
					var inputs = tr.find("input");
					inputs.eq(0).prop("value",name_group);
					inputs.eq(1).prop("checked",open_group);
					tr.data("id", id_group).addClass("snippet_group");
					body_groups.append(tr);
				}
			}
		});
	},
	cancel: function()
	{
		that.conf.cancel = true;
		that.window.close();
	},
	save: function()
	{
		//Borramos todos los grupos que se hayan marcado de esa manera
		var deletes = $j("tr.delete").each(function(){
			var id_group = $j(this).data("id");
			Store.deleteGroup(id_group);
		});

		//Insertamos los elementos nuevos
		$j("tr.new").each(function(){
			var inputs = $j(this).find("input");
			var name_group = inputs.eq(0).prop("value");
			var checked = inputs.eq(1).prop("checked");
			Store.insertGroup(name_group, checked);
		});

		//Actualizamos los valores de los elementos que restan
		$j("tr.snippet_group").not("tr.delete").each(function(){
			var id_group = $j(this).data("id");
			var inputs = $j(this).find("input");
			var name_group = inputs.eq(0).prop("value");
			var checked = inputs.eq(1).prop("checked");
			Store.updateGroup(id_group, name_group, checked);
		});

		that.conf.save = true;
		that.window.close();
	}
};


//**********************************************************************************************//
// Registration

return SnippetsGroupWindowEdit;

//**********************************************************************************************//
});
